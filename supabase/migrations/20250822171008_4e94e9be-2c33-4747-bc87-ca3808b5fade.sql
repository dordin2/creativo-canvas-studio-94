-- Extend trigger to fire on INSERT and UPDATE for "profiles 2"
-- Safe drop existing trigger if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE t.tgname = 'trg_profiles2_create_user'
      AND c.relname = 'profiles 2'
  ) THEN
    EXECUTE 'DROP TRIGGER trg_profiles2_create_user ON "profiles 2"';
  END IF;
END $$;

-- Recreate trigger to also run on updates of the relevant columns
CREATE TRIGGER trg_profiles2_create_user
AFTER INSERT OR UPDATE OF "phone number", email ON "profiles 2"
FOR EACH ROW
EXECUTE FUNCTION public.trigger_profiles2_create_user();