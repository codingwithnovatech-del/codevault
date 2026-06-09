-- App settings table for global key-value config
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz default now()
);

alter table public.app_settings enable row level security;

create policy "Anyone can read app_settings"
  on public.app_settings for select using (true);

-- RPC: get setting (public)
create or replace function public.get_app_setting(p_key text)
returns jsonb
language sql
stable
as $$
  select value from public.app_settings where key = p_key;
$$;

-- RPC: set setting (security definer — bypasses RLS)
create or replace function public.set_app_setting(p_key text, p_value jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_settings (key, value, updated_at)
  values (p_key, p_value, now())
  on conflict (key) do update set value = p_value, updated_at = now();
end;
$$;

-- Seed default support links
select public.set_app_setting('support_links', '{
  "telegram": {"enabled": true, "url": "https://t.me/codevault"},
  "reportBug": {"enabled": false, "url": ""},
  "docs": {"enabled": false, "url": ""},
  "github": {"enabled": false, "url": ""},
  "email": {"enabled": true, "url": "support@codevault.dev"}
}');
