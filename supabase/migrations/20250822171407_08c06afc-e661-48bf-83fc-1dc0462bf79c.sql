-- Create a direct user creation function that bypasses the HTTP endpoint
CREATE OR REPLACE FUNCTION public.create_auth_user_directly(
  p_email text,
  p_phone text
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_user_id uuid;
  v_phone_digits text;
BEGIN
  -- Clean phone to digits only
  v_phone_digits := regexp_replace(p_phone, '\D', '', 'g');
  
  -- Validate email and phone
  IF NOT public.is_valid_email_com(p_email) THEN
    RETURN 'Invalid email format';
  END IF;
  
  IF length(v_phone_digits) != 10 THEN
    RETURN 'Phone must have exactly 10 digits';
  END IF;
  
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = lower(p_email)) THEN
    RETURN 'User already exists';
  END IF;
  
  -- Insert into auth.users directly
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at,
    is_anonymous
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    lower(p_email),
    crypt(v_phone_digits, gen_salt('bf')),
    now(),
    now(),
    '',
    now(),
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider": "email", "providers": ["email"]}',
    '{"source": "profiles2_trigger"}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ) RETURNING id INTO v_user_id;
  
  RETURN 'User created with ID: ' || v_user_id::text;
  
EXCEPTION WHEN OTHERS THEN
  RETURN 'Error: ' || SQLERRM;
END;
$$;