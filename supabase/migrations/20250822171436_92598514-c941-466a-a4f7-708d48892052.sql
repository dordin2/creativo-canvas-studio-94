-- Update the trigger function to use the direct auth user creation
CREATE OR REPLACE FUNCTION public.trigger_profiles2_create_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email text;
  v_phone_raw text;
  v_phone_digits text;
  v_result text;
BEGIN
  v_email := coalesce(new.email, '');
  v_phone_raw := coalesce(new."phone number", '');
  v_phone_digits := regexp_replace(v_phone_raw, '\D', '', 'g');

  -- Only proceed if email ends with .com and phone has exactly 10 digits
  IF public.is_valid_email_com(v_email) AND length(v_phone_digits) = 10 THEN
    SELECT public.create_auth_user_directly(lower(v_email), v_phone_digits) INTO v_result;
    -- Log the result (can be seen in database logs)
    RAISE NOTICE 'User creation result: %', v_result;
  END IF;

  RETURN new;
END;
$$;