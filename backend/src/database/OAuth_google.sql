CREATE TYPE provider AS ENUM ('local', 'google');
ALTER TABLE users add column "provider" provider;
UPDATE users SET provider = 'local' WHERE provider IS NULL;
ALTER TABLE users ALTER COLUMN "provider" SET NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
