-- Add signedAt field to Contract table
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "signedAt" TIMESTAMP(3);


