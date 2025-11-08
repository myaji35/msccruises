-- CreateTable
CREATE TABLE "FlightItinerary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cruiseId" TEXT NOT NULL,
    "segmentType" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "airline" TEXT NOT NULL,
    "airlineCode" TEXT,
    "departureAirport" TEXT NOT NULL,
    "departureCode" TEXT NOT NULL,
    "departureCity" TEXT,
    "departureCountry" TEXT,
    "departureTime" TEXT NOT NULL,
    "departureDate" DATETIME NOT NULL,
    "departureTerminal" TEXT,
    "arrivalAirport" TEXT NOT NULL,
    "arrivalCode" TEXT NOT NULL,
    "arrivalCity" TEXT,
    "arrivalCountry" TEXT,
    "arrivalTime" TEXT NOT NULL,
    "arrivalDate" DATETIME NOT NULL,
    "arrivalTerminal" TEXT,
    "duration" INTEGER,
    "aircraft" TEXT,
    "cabinClass" TEXT,
    "stops" INTEGER NOT NULL DEFAULT 0,
    "stopoverInfo" TEXT,
    "bookingClass" TEXT,
    "seatInfo" TEXT,
    "baggageAllowance" TEXT,
    "mealService" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FlightItinerary_cruiseId_fkey" FOREIGN KEY ("cruiseId") REFERENCES "Cruise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "FlightItinerary_cruiseId_idx" ON "FlightItinerary"("cruiseId");

-- CreateIndex
CREATE INDEX "FlightItinerary_segmentType_idx" ON "FlightItinerary"("segmentType");

-- CreateIndex
CREATE INDEX "FlightItinerary_departureDate_idx" ON "FlightItinerary"("departureDate");
