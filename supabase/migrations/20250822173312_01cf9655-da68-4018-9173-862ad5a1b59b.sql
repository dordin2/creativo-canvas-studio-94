-- Relax RLS on public."profiles 2" to support staged writes from automation
ALTER TABLE public."profiles 2" ENABLE ROW LEVEL SECURITY;

-- Replace strict policies with permissive ones for anon/authenticated
DROP POLICY IF EXISTS "Allow insert with valid email+phone (public)" ON public."profiles 2";
DROP POLICY IF EXISTS "Allow update with valid email+phone (public)" ON public."profiles 2";

CREATE POLICY "Automation can insert rows"
ON public."profiles 2"
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Automation can update rows"
ON public."profiles 2"
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Keep the trigger as-is: it only creates an auth user when email ends with .com and phone has 10 digits
-- (public.trigger_profiles2_create_user performs the validation).