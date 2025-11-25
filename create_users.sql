-- Run this in Supabase SQL Editor to create the default users

-- 1. Create Admin User
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'admin@medicinna.app',
  crypt('admin', gen_salt('bf')),
  now(),
  '{"role": "admin"}'
);

-- 2. Create Hospital User
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'hospital@medicinna.app',
  crypt('hospital', gen_salt('bf')),
  now(),
  '{"role": "hospital", "hospital_name": "City General"}'
);

-- 3. Create Manufacturer User
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'factory@medicinna.app',
  crypt('factory', gen_salt('bf')),
  now(),
  '{"role": "manufacturer"}'
);
