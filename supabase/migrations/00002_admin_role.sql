-- Add admin role to profiles
alter table public.profiles
  add column if not exists is_admin boolean default false;

-- Only the profile creator (you) should be admin
-- Run this AFTER you sign up:
-- update public.profiles set is_admin = true where email = 'your-github-email@example.com';
-- Or use your user ID:
-- update public.profiles set is_admin = true where id = 'your-user-uuid';

-- Update RLS: only admins can mutate templates/components
drop policy if exists "Authenticated users can create templates" on public.templates;
drop policy if exists "Authors can update their own templates" on public.templates;
drop policy if exists "Authors can delete their own templates" on public.templates;
drop policy if exists "Authenticated users can create components" on public.components;
drop policy if exists "Authors can update their own components" on public.components;
drop policy if exists "Authors can delete their own components" on public.components;

create policy "Only admins can create templates"
  on public.templates for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Only admins can update templates"
  on public.templates for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Only admins can delete templates"
  on public.templates for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Only admins can create components"
  on public.components for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Only admins can update components"
  on public.components for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Only admins can delete components"
  on public.components for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
