-- Add missing fields to Contract table
ALTER TABLE "contracts" ADD COLUMN "priceCents" INTEGER;
ALTER TABLE "contracts" ADD COLUMN "timeline" INTEGER;
ALTER TABLE "contracts" ADD COLUMN "deliverables" TEXT;
