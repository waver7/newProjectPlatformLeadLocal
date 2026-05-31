-- Add username column (nullable first so existing rows can be backfilled)
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Backfill existing rows with a unique username derived from the email
-- local-part plus a short slice of the id to guarantee uniqueness.
UPDATE "User"
SET "username" = lower(split_part("email", '@', 1)) || '_' || substring("id" FROM 1 FOR 6);

-- Enforce NOT NULL now that every row has a value
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- Unique index
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
