-- Create admin user
-- Username: admin
-- Email: admin@example.com  
-- Password: Admin123!
-- 
-- IMPORTANT: This is a default admin user. Please change the password after first login!
-- 
-- Note: The password hash below needs to be generated using the application's PasswordService.
-- To generate a real hash, you can:
-- 1. Run the application and use the password service to hash "Admin123!"
-- 2. Or manually create a user through the registration endpoint and then assign admin role
-- 
-- For now, this migration creates the user structure. You'll need to update the password_hash
-- with a real Argon2id hash before using this account.
-- 
-- Argon2id format: $argon2id$v=19$m=19456,t=2,p=1$<base64_salt>$<base64_hash>
INSERT INTO users (id, username, email, password_hash, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'admin',
    'admin@example.com',
    -- TODO: Replace this with a real Argon2id hash for "Admin123!"
    -- You can generate it by running the application and using PasswordService
    -- Example format: $argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>
    '$argon2id$v=19$m=19456,t=2,p=1$dGVzdF9zYWx0X2Zvcl9hZG1pbg$dGVzdF9oYXNoX3BsYWNlaG9sZGVyX3VwZGF0ZV9tZV9hZnRlcl9taWdyYXRpb24',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users 
    WHERE LOWER(username) = 'admin' 
    AND deleted_at IS NULL
);

-- Assign admin role to the admin user
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT u.id, r.id, NOW()
FROM users u
CROSS JOIN roles r
WHERE u.username = 'admin' 
  AND r.name = 'admin'
  AND u.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

