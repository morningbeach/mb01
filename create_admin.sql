-- Create or update admin user
-- Usage: paste this into psql on the server (or run `psql <conn> -f create_admin.sql`)

-- Variant A: table name with exact Prisma model quoting (common when migrations used Prisma)
-- Insert into AdminUser with only columns that exist in schema
INSERT INTO "AdminUser" (id, email, name, password, role)
VALUES
  ('id_miii27hy8f0f93cd', 'morningbeachtw@gmail.com', 'Admin', '$2b$10$Nw1QWNwqfWasyOAaZs/7BeWDNsSkEdxA/LcpQDuHyXMK02bYpaMx.', 'admin')
ON CONFLICT (email) DO UPDATE
  SET password = EXCLUDED.password,
      role = EXCLUDED.role;

-- Variant B: lowercase table name (if your table is created without quotes)
-- Uncomment and use this variant if the above fails with "relation \"AdminUser\" does not exist"
-- INSERT INTO adminuser (id, email, name, password, role, createdat, updatedat)
-- VALUES
--   ('id_miii27hy8f0f93cd', 'morningbeachtw@gmail.com', 'Admin', '$2b$10$Nw1QWNwqfWasyOAaZs/7BeWDNsSkEdxA/LcpQDuHyXMK02bYpaMx.', 'admin', '2025-11-28T06:46:59.447Z', '2025-11-28T06:46:59.447Z')
-- ON CONFLICT (email) DO UPDATE
--   SET password = EXCLUDED.password,
--       updatedat = EXCLUDED.updatedat;

-- Notes:
-- 1) The password value is a bcrypt hash for the plaintext "qwrr3543".
-- 2) If your schema uses different column names, adjust column names accordingly.
-- 3) To run this file with psql (PowerShell example):
--    psql "postgresql://postgres:QWrr35437316@44.239.209.64:5432/postgres?sslmode=require" -f create_admin.sql
-- 4) Alternatively, open psql and paste the SQL directly.
