-- Add preferences column to profiles for theme, onboarding, etc.
alter table public.profiles
  add column if not exists preferences jsonb default '{}'::jsonb;

-- RPC: update profile preferences
create or replace function public.update_profile_preferences(user_id uuid, prefs jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_prefs jsonb;
  merged jsonb;
begin
  select coalesce(preferences, '{}'::jsonb) into current_prefs
  from public.profiles where id = user_id;
  merged := current_prefs || prefs;
  update public.profiles set preferences = merged where id = user_id;
  return merged;
end;
$$;
