-- AlterTable: add state, latitude, longitude to Request
ALTER TABLE "Request" ADD COLUMN "state" TEXT;
ALTER TABLE "Request" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Request" ADD COLUMN "longitude" DOUBLE PRECISION;
