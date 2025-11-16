-- AlterTable
ALTER TABLE "Cruise" ADD COLUMN "bookingStatus" TEXT DEFAULT '일반';
ALTER TABLE "Cruise" ADD COLUMN "currentParticipants" INTEGER DEFAULT 0;
ALTER TABLE "Cruise" ADD COLUMN "departureDate" DATETIME;
ALTER TABLE "Cruise" ADD COLUMN "maxParticipants" INTEGER;
ALTER TABLE "Cruise" ADD COLUMN "originalPrice" REAL;
ALTER TABLE "Cruise" ADD COLUMN "promotionTag" TEXT;
ALTER TABLE "Cruise" ADD COLUMN "returnDate" DATETIME;
