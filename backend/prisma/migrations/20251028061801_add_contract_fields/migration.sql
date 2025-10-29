-- Add missing fields to Contract table
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "priceCents" INTEGER;
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "timeline" INTEGER;
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "deliverables" TEXT;



