create or replace function public.create_user_direct(email text, password text, _username text default null, _display_name text default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid;
  encrypted_pw text;
  final_username text;
  final_display_name text;
begin
  encrypted_pw := crypt(password, gen_salt('bf'));
  final_username := coalesce(_username, split_part(email, '@', 1));
  final_display_name := coalesce(_display_name, final_username);
  insert into auth.users (email, encrypted_password, email_confirmed_at, confirmation_sent_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token, is_super_admin, phone, phone_confirmed_at, phone_change, phone_change_token, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, is_sso_user, deleted_at, role)
  values (
    email,
    encrypted_pw,
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('user_name', final_username, 'display_name', final_display_name),
    now(),
    now(),
    '',
    '',
    '',
    '',
    false,
    null,
    null,
    '',
    '',
    '',
    0,
    null,
    '',
    false,
    null,
    'authenticated'
  )
  returning id into user_id;
  return json_build_object('id', user_id::text, 'email', email);
end;
$$;

-- Function to get all profiles (bypasses RLS for admin password-based auth)
create or replace function public.get_all_profiles()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select json_agg(json_build_object(
    'id', p.id,
    'username', p.username,
    'email', p.email,
    'title', p.title,
    'bio', p.bio,
    'is_admin', p.is_admin,
    'is_disabled', p.is_disabled,
    'copies_count', p.copies_count,
    'stars_count', p.stars_count,
    'created_at', p.created_at
  ) order by p.created_at desc)
  from public.profiles p
  into result;
  return coalesce(result, '[]'::json);
end;
$$;

-- Function to toggle user disabled status (bypasses RLS)
create or replace function public.admin_toggle_user_disabled(user_id uuid, disabled boolean)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  update public.profiles
  set is_disabled = disabled
  where id = user_id
  returning row_to_json(profiles.*) into result;
  return result;
end;
$$;

-- Function to delete user and all their data (bypasses RLS)
create or replace function public.admin_delete_user(user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.saved_templates where profile_id = user_id;
  delete from public.saved_components where profile_id = user_id;
  delete from public.api_tokens where profile_id = user_id;
  delete from public.profiles where id = user_id;
end;
$$;

-- Function to get user stats (bypasses RLS)
create or replace function public.admin_get_user_stats(user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_templates_count int;
  saved_components_count int;
  api_tokens_count int;
begin
  select count(*) into saved_templates_count from public.saved_templates where profile_id = user_id;
  select count(*) into saved_components_count from public.saved_components where profile_id = user_id;
  select count(*) into api_tokens_count from public.api_tokens where profile_id = user_id;
  return json_build_object(
    'savedTemplatesCount', saved_templates_count,
    'savedComponentsCount', saved_components_count,
    'apiTokensCount', api_tokens_count
  );
end;
$$;
