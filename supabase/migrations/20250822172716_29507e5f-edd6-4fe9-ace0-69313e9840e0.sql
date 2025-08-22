-- Enable RLS (idempotent)
ALTER TABLE public."profiles 2" ENABLE ROW LEVEL SECURITY;

-- Create/replace policies to allow public (anon/authenticated) to insert/update with validation
DROP POLICY IF EXISTS "Allow insert with valid email+phone (public)" ON public."profiles 2";
DROP POLICY IF EXISTS "Allow update with valid email+phone (public)" ON public."profiles 2";

CREATE POLICY "Allow insert with valid email+phone (public)"
ON public."profiles 2"
FOR INSERT
TO anon, authenticated
WITH CHECK (
  public.is_valid_email_com(coalesce(email, '')) AND
  length(regexp_replace(coalesce("phone number", ''), '\\D', '', 'g')) = 10
);

CREATE POLICY "Allow update with valid email+phone (public)"
ON public."profiles 2"
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (
  public.is_valid_email_com(coalesce(email, '')) AND
  length(regexp_replace(coalesce("phone number", ''), '\\D', '', 'g')) = 10
);

-- Attach trigger to auto-create auth user on insert/update
DROP TRIGGER IF EXISTS profiles2_auto_create_auth_user ON public."profiles 2";
CREATE TRIGGER profiles2_auto_create_auth_user
AFTER INSERT OR UPDATE OF email, "phone number"
ON public."profiles 2"
FOR EACH ROW
EXECUTE FUNCTION public.trigger_profiles2_create_user();