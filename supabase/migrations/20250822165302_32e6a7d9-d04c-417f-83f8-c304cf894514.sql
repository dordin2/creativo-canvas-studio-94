-- Enable HTTP requests from Postgres using pg_net
create extension if not exists pg_net;

-- Helper: validate email that ends with .com (simple regex)
create or replace function public.is_valid_email_com(email text)
returns boolean
language sql
immutable
as $$
  select email ~* '^[^@\s]+@[^@\s]+\.com$';
$$;

-- Trigger function: on insert to "profiles 2", call Edge Function to create user when valid
create or replace function public.trigger_profiles2_create_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email text;
  v_phone_raw text;
  v_phone_digits text;
  v_url text := 'https://dmwwgrbleohkopoqupzo.functions.supabase.co/create-user-from-profiles2';
begin
  v_email := coalesce(new.email, '');
  v_phone_raw := coalesce(new."phone number", '');
  -- keep only digits
  v_phone_digits := regexp_replace(v_phone_raw, '\D', '', 'g');

  -- Only proceed if email ends with .com and phone has exactly 10 digits
  if public.is_valid_email_com(v_email) and length(v_phone_digits) = 10 then
    perform net.http_post(
      url := v_url,
      headers := json_build_object('Content-Type','application/json'),
      body := json_build_object(
        'email', lower(v_email),
        'phone', v_phone_digits
      )::text
    );
  end if;

  return new;
end;
$$;

-- Create the trigger on table "profiles 2"
DROP TRIGGER IF EXISTS trg_profiles2_create_user ON "profiles 2";
create trigger trg_profiles2_create_user
after insert on "profiles 2"
for each row
execute function public.trigger_profiles2_create_user();