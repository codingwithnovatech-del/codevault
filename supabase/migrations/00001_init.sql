-- CodeVault Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  title text default '',
  bio text default '',
  avatar text default '',
  copies_count integer default 0,
  stars_count integer default 0,
  contributions jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Templates table
create table public.templates (
  id text primary key,
  title text not null,
  description text not null,
  image text not null,
  alt text not null,
  framework text not null,
  category text not null,
  code text not null,
  stars integer default 0,
  author text not null,
  views text default '0',
  last_updated text default 'now',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Components table
create table public.components (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  code text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Saved templates junction table
create table public.saved_templates (
  profile_id uuid references public.profiles(id) on delete cascade,
  template_id text references public.templates(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (profile_id, template_id)
);

-- Saved components junction table
create table public.saved_components (
  profile_id uuid references public.profiles(id) on delete cascade,
  component_id text references public.components(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (profile_id, component_id)
);

-- API tokens table
create table public.api_tokens (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  token text not null unique,
  created_at timestamptz default now(),
  last_used text default 'Never'
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.templates enable row level security;
alter table public.components enable row level security;
alter table public.saved_templates enable row level security;
alter table public.saved_components enable row level security;
alter table public.api_tokens enable row level security;

-- RLS Policies

-- Profiles: users can read all profiles, update only own
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Templates: public read, authenticated users can create/update/delete
create policy "Templates are viewable by everyone"
  on public.templates for select using (true);

create policy "Authenticated users can create templates"
  on public.templates for insert with check (auth.role() = 'authenticated');

create policy "Authors can update their own templates"
  on public.templates for update using (auth.uid() = created_by);

create policy "Authors can delete their own templates"
  on public.templates for delete using (auth.uid() = created_by);

-- Components: public read, authenticated users can manage
create policy "Components are viewable by everyone"
  on public.components for select using (true);

create policy "Authenticated users can create components"
  on public.components for insert with check (auth.role() = 'authenticated');

create policy "Authors can update their own components"
  on public.components for update using (auth.uid() = created_by);

create policy "Authors can delete their own components"
  on public.components for delete using (auth.uid() = created_by);

-- Saved templates: users manage their own saves
create policy "Users can view their own saved templates"
  on public.saved_templates for select using (auth.uid() = profile_id);

create policy "Users can save templates"
  on public.saved_templates for insert with check (auth.uid() = profile_id);

create policy "Users can unsave templates"
  on public.saved_templates for delete using (auth.uid() = profile_id);

-- Saved components: users manage their own saves
create policy "Users can view their own saved components"
  on public.saved_components for select using (auth.uid() = profile_id);

create policy "Users can save components"
  on public.saved_components for insert with check (auth.uid() = profile_id);

create policy "Users can unsave components"
  on public.saved_components for delete using (auth.uid() = profile_id);

-- API tokens: users manage their own tokens
create policy "Users can view their own tokens"
  on public.api_tokens for select using (auth.uid() = profile_id);

create policy "Users can create their own tokens"
  on public.api_tokens for insert with check (auth.uid() = profile_id);

create policy "Users can delete their own tokens"
  on public.api_tokens for delete using (auth.uid() = profile_id);

-- Seed data: default templates
insert into public.templates (id, title, description, image, alt, framework, category, code, stars, author, views, last_updated) values
  ('nexus-admin', 'Nexus Admin Dashboard', 'A comprehensive administrative panel with real-time analytics widgets, user management tables, and system health monitors.', 'https://lh3.googleusercontent.com/aida/AP1WRLuDEP3VYlR60qtB87Edr8Sa9tXB47d--97jqY3xK3tcQfkikT_M3POzbaYwcCVN76GmFK5EO6BK3xPvwII6KCyxHC2Z7DM7cpdBciGK4FHuARh4iR5QX1LeLAmCp7I_En9weJtywYiyNEAwqewYcCiJLZUC6K4vSUcHC7AuttJRLYCJdkTcLWATWlPgJXdPvPoMc3bR962czndOv5v8hYf_uGSxZ0rIx0Q5z6xpmqV5kzGLDdCWMxEIGCU', 'A high-fidelity mockup of a dark-mode SaaS dashboard interface displayed on a sleek, modern screen.', 'Vue.js', 'Dashboards', '<template>\n  <div class="min-h-screen bg-slate-950 text-slate-100 flex">\n    <aside class="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md p-6">\n      <div class="flex items-center gap-2 mb-8 font-semibold text-lg text-blue-400">\n        <div class="h-6 w-6 rounded bg-blue-500 flex items-center justify-center text-white text-xs">N</div>\n        Nexus Admin\n      </div>\n    </aside>\n  </div>\n</template>', 342, 'VueMastery', '4.8k', '2 days ago'),
  ('stellar-landing', 'Stellar Dev Landing', 'High-conversion landing page optimized for SaaS products, featuring animated hero sections and bento-grid feature highlights.', 'https://lh3.googleusercontent.com/aida/AP1WRLsUOtV4ONvl_lGfSFCc3R9T1nWuZukZJ55FVjmUjVD9DiK9g3QIk3mTcHqLk1c0eH971P4jcF1LD7UdqpbFR5VYjn6xacX_CfyiI_P9begbhTYcDLkkEgqRingiPh6ysewIHGiwrpG0GyL1TrL2Jnqpv7YEsQSP3wzx13FbYRLGTBMM87biVzGelXWYlelhzTqCL9EZKLkaVTCCC6Diq0WRdkc9ZxKhhyHFLSI2pqqmfv-KsimBDNkNRQ', 'A modern, dark-themed landing page design featuring abstract geometric wireframes and glowing electric blue accents.', 'React', 'Landing Pages', 'import React from "react";\n\nexport default function StellarLanding() {\n  return (\n    <div class="min-h-screen bg-slate-950 text-slate-100">\n      <nav class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">\n        <span class="text-xl font-bold">Stellar.io</span>\n      </nav>\n      <section class="max-w-5xl mx-auto text-center px-6 pt-24 pb-32">\n        <h1 class="text-5xl font-bold">The Deployment Engine</h1>\n      </section>\n    </div>\n  );\n}', 512, 'StellarDev', '9.2k', '5 days ago'),
  ('minimalist-portfolio', 'Minimalist Coder Portfolio', 'A clean, distraction-free portfolio template designed specifically to showcase open-source contributions and technical case studies.', 'https://lh3.googleusercontent.com/aida/AP1WRLuQJYiyY4OyhcBAkKwRGaAYWQTg9gEAwHzPFZt5_eMVyXxaSIP7sDQGQnnxM_vsYKJjEFfFC-kmIEIGbMgbcGFnvReOv4aT_lXqGHX41yEqcFcemOvI1G3EUR9aB8sFFBXQBBAXqQ9_4_qJYFvnVbpMVwG37FxVBcQJxoqjr6l7rsGpEKQBYkIgCtPIDoGWyPIsEfxFbcYPE2okqbID86DGCSkUhKSa0Y_h8sr99X3VrfWwdZFXbqX17Ig', 'A minimalist, monochromatic developer portfolio layout on a digital screen.', 'SvelteKit', 'Portfolios', '<script>\n  let user = {\n    name: "Alex Rivera",\n    role: "Staff Infrastructure Engineer",\n    projects: []\n  };\n</script>\n\n<div class="min-h-screen bg-neutral-950 font-mono text-neutral-300 p-8 md:p-24 max-w-3xl mx-auto">\n  <h1 class="text-xl font-bold text-white">{user.name}</h1>\n  <span class="text-xs text-blue-400">{user.role}</span>\n</div>', 219, 'SvelteSpirit', '2.4k', '1 week ago');

-- Seed data: default components
insert into public.components (id, title, description, category, code) values
  ('glass-btn', 'Glassmorphic Button', 'An elegant glass button reflecting subtle borders, backdrop blurs, and hover transformations.', 'Buttons', '<button class="relative px-6 py-2.5 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-slate-200 shadow-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-95">\n  Interactive Glass\n</button>'),
  ('glowing-card', 'Glowing Tech Card', 'A dark, border-highlighted container that glows electric blue upon hover inputs.', 'Cards', '<div class="p-6 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-3 cursor-pointer group hover:border-[#adc6ff] hover:shadow-[0_0_20px_rgba(173,198,255,0.15)] transition-all duration-300">\n  <div class="flex justify-between items-center">\n    <span class="text-xs text-slate-400 font-mono">NODE_CLUSTER_01</span>\n    <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>\n  </div>\n  <h3 class="text-lg font-bold text-white tracking-tight">Ingress Gateway</h3>\n  <p class="text-sm text-slate-400 leading-relaxed font-light">Traffic router forwarding client packet handshakes dynamically.</p>\n</div>'),
  ('sidebar-nav', 'Minimalist Side Rail', 'A sleek vertical navigation item optimized for compact layout structures.', 'Navigation', '<div class="w-14 bg-slate-950 border-r border-slate-900 h-screen py-6 flex flex-col items-center justify-between">\n  <div class="space-y-6">\n    <div class="h-8 w-8 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">C</div>\n  </div>\n</div>'),
  ('animated-input', 'Glowing Input Focus', 'A text form field that scales and glows with an Electric Blue outline on click focus.', 'Forms', '<div class="space-y-2 max-w-sm">\n  <label class="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">Access Secret Key</label>\n  <input type="text" placeholder="cv_token_..." class="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 transition-all focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30" />\n</div>'),
  ('blur-overlay', 'Glassmorphic Dialog Backdrop', 'An immersive backdrop layer utilizing deep opacity gradients and smooth glass blurs.', 'Overlays', '<div class="fixed inset-0 bg-slate-950/60 backdrop-blur-lg flex items-center justify-center p-4 z-50">\n  <div class="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-4">\n    <button class="absolute top-4 right-4 text-slate-400 hover:text-white">&times;</button>\n    <h3 class="text-lg font-bold text-white">Ingress Action Secure</h3>\n    <p class="text-sm text-slate-400">Authenticating operations node connection.</p>\n  </div>\n</div>');

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, title, bio)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'user_name', split_part(new.email, '@', 1)),
    'Developer',
    'CodeVault user'
  );
  return new;
end;
$$;

-- Trigger the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
