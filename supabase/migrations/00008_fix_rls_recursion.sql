-- Fix infinite RLS recursion on profiles table
-- The problem: policies that SELECT from profiles inside the policy itself
-- cause infinite recursion because the inner SELECT re-triggers RLS.
-- Solution: use a security definer function that bypasses RLS.

-- Create security definer function to check admin status (bypasses RLS)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_admin = true);
$$;

-- Fix profiles policies
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select using (
    auth.uid() = id or public.is_admin()
  );

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update using (
    public.is_admin()
  );

-- Fix template policies
drop policy if exists "Only admins can create templates" on public.templates;
create policy "Only admins can create templates"
  on public.templates for insert with check (
    public.is_admin()
  );

drop policy if exists "Only admins can update templates" on public.templates;
create policy "Only admins can update templates"
  on public.templates for update using (
    public.is_admin()
  );

drop policy if exists "Only admins can delete templates" on public.templates;
create policy "Only admins can delete templates"
  on public.templates for delete using (
    public.is_admin()
  );

-- Fix component policies
drop policy if exists "Only admins can create components" on public.components;
create policy "Only admins can create components"
  on public.components for insert with check (
    public.is_admin()
  );

drop policy if exists "Only admins can update components" on public.components;
create policy "Only admins can update components"
  on public.components for update using (
    public.is_admin()
  );

drop policy if exists "Only admins can delete components" on public.components;
create policy "Only admins can delete components"
  on public.components for delete using (
    public.is_admin()
  );

-- Fix saved_templates policies (admin overrides)
drop policy if exists "Admins can view all saved templates" on public.saved_templates;
create policy "Admins can view all saved templates"
  on public.saved_templates for select using (
    auth.uid() = profile_id or public.is_admin()
  );

drop policy if exists "Admins can delete saved templates" on public.saved_templates;
create policy "Admins can delete saved templates"
  on public.saved_templates for delete using (
    public.is_admin()
  );

-- Fix saved_components policies (admin overrides)
drop policy if exists "Admins can view all saved components" on public.saved_components;
create policy "Admins can view all saved components"
  on public.saved_components for select using (
    auth.uid() = profile_id or public.is_admin()
  );

drop policy if exists "Admins can delete saved components" on public.saved_components;
create policy "Admins can delete saved components"
  on public.saved_components for delete using (
    public.is_admin()
  );

-- Fix api_tokens policies (admin overrides)
drop policy if exists "Admins can view all tokens" on public.api_tokens;
create policy "Admins can view all tokens"
  on public.api_tokens for select using (
    auth.uid() = profile_id or public.is_admin()
  );

drop policy if exists "Admins can delete any token" on public.api_tokens;
create policy "Admins can delete any token"
  on public.api_tokens for delete using (
    public.is_admin()
  );
