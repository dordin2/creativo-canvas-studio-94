-- Nudge trigger by updating the row to fire AFTER UPDATE
UPDATE "profiles 2"
SET email = lower(email)
WHERE email = 'nitzanikatif1@gmail.com';