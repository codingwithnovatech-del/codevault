-- User management: disable users, visibility control on content

-- Add email column to profiles
alter table public.profiles
  add column if not exists email text default '';

-- Add is_disabled flag for user suspension
alter table public.profiles
  add column if not exists is_disabled boolean default false;

-- Add visibility and featured flags to templates
alter table public.templates
  add column if not exists is_visible boolean default true;

alter table public.templates
  add column if not exists is_featured boolean default false;

-- Add visibility and featured flags to components
alter table public.components
  add column if not exists is_visible boolean default true;

alter table public.components
  add column if not exists is_featured boolean default false;

-- Update the auto-profile trigger to store email and use empty defaults
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, title, bio)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'user_name', split_part(new.email, '@', 1)),
    new.email,
    '',
    ''
  );
  return new;
end;
$$;

-- Admin-only policies for viewing/updating all profiles
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select using (
    auth.uid() = id or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Admin policies for templates (override existing)
drop policy if exists "Templates are viewable by everyone" on public.templates;
create policy "Templates are viewable by everyone"
  on public.templates for select using (true);

-- Admin policies for components (override existing)
drop policy if exists "Components are viewable by everyone" on public.components;
create policy "Components are viewable by everyone"
  on public.components for select using (true);

-- Only admins can view disabled users' data
drop policy if exists "Admins can view all saved templates" on public.saved_templates;
create policy "Admins can view all saved templates"
  on public.saved_templates for select using (
    auth.uid() = profile_id or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "Admins can view all saved components" on public.saved_components;
create policy "Admins can view all saved components"
  on public.saved_components for select using (
    auth.uid() = profile_id or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "Admins can view all tokens" on public.api_tokens;
create policy "Admins can view all tokens"
  on public.api_tokens for select using (
    auth.uid() = profile_id or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Admin can delete any saved data
drop policy if exists "Admins can delete saved templates" on public.saved_templates;
create policy "Admins can delete saved templates"
  on public.saved_templates for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "Admins can delete saved components" on public.saved_components;
create policy "Admins can delete saved components"
  on public.saved_components for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "Admins can delete any token" on public.api_tokens;
create policy "Admins can delete any token"
  on public.api_tokens for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
