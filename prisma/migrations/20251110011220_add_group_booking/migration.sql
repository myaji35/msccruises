-- CreateTable
CREATE TABLE "GroupBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cruiseId" TEXT NOT NULL,
    "groupLeaderId" TEXT NOT NULL,
    "groupName" TEXT,
    "numCabins" INTEGER NOT NULL,
    "totalPassengers" INTEGER NOT NULL,
    "discountPercentage" REAL NOT NULL DEFAULT 0,
    "baseTotal" REAL NOT NULL,
    "discountAmount" REAL NOT NULL,
    "finalTotal" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "groupLeaderEmail" TEXT,
    "groupLeaderPhone" TEXT,
    "notes" TEXT,
    "salesRepId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "cruiseId" TEXT NOT NULL,
    "cruiseName" TEXT NOT NULL,
    "shipName" TEXT NOT NULL,
    "departureDate" DATETIME NOT NULL,
    "returnDate" DATETIME NOT NULL,
    "departurePort" TEXT NOT NULL,
    "cabinCategory" TEXT NOT NULL,
    "cabinNumber" TEXT,
    "totalPrice" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isPackage" BOOLEAN NOT NULL DEFAULT false,
    "outboundFlight" TEXT,
    "returnFlight" TEXT,
    "packageDiscount" REAL,
    "partnerId" TEXT,
    "partnerCommission" REAL,
    "groupBookingId" TEXT,
    "isGroupLeader" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "PartnerInfo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_groupBookingId_fkey" FOREIGN KEY ("groupBookingId") REFERENCES "GroupBooking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("bookingNumber", "cabinCategory", "cabinNumber", "createdAt", "cruiseId", "cruiseName", "currency", "departureDate", "departurePort", "id", "isPackage", "outboundFlight", "packageDiscount", "partnerCommission", "partnerId", "paymentStatus", "returnDate", "returnFlight", "shipName", "status", "totalPrice", "updatedAt", "userId") SELECT "bookingNumber", "cabinCategory", "cabinNumber", "createdAt", "cruiseId", "cruiseName", "currency", "departureDate", "departurePort", "id", "isPackage", "outboundFlight", "packageDiscount", "partnerCommission", "partnerId", "paymentStatus", "returnDate", "returnFlight", "shipName", "status", "totalPrice", "updatedAt", "userId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON "Booking"("bookingNumber");
CREATE INDEX "Booking_groupBookingId_idx" ON "Booking"("groupBookingId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "GroupBooking_cruiseId_idx" ON "GroupBooking"("cruiseId");

-- CreateIndex
CREATE INDEX "GroupBooking_groupLeaderId_idx" ON "GroupBooking"("groupLeaderId");

-- CreateIndex
CREATE INDEX "GroupBooking_status_idx" ON "GroupBooking"("status");
