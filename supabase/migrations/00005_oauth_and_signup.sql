-- Update create_user_direct to accept optional username/display_name
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

-- Update handle_new_user trigger to use display_name from metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
  dname text;
begin
  uname := coalesce(new.raw_user_meta_data ->> 'user_name', split_part(new.email, '@', 1));
  dname := coalesce(new.raw_user_meta_data ->> 'display_name', uname);
  insert into public.profiles (id, email, username, title, bio, avatar)
  values (new.id, new.email, uname, dname, '', '');
  return new;
end;
$$;
