-- CreateTable
CREATE TABLE "Cruise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shipName" TEXT NOT NULL,
    "description" TEXT,
    "departurePort" TEXT NOT NULL,
    "destinations" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "startingPrice" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'active',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CruiseMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cruiseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filesize" INTEGER,
    "mimeType" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "alt" TEXT,
    "caption" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CruiseMedia_cruiseId_fkey" FOREIGN KEY ("cruiseId") REFERENCES "Cruise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CruiseItinerary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cruiseId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "port" TEXT NOT NULL,
    "arrival" TEXT,
    "departure" TEXT,
    "activities" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CruiseItinerary_cruiseId_fkey" FOREIGN KEY ("cruiseId") REFERENCES "Cruise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CruiseMedia_cruiseId_idx" ON "CruiseMedia"("cruiseId");

-- CreateIndex
CREATE INDEX "CruiseItinerary_cruiseId_idx" ON "CruiseItinerary"("cruiseId");
