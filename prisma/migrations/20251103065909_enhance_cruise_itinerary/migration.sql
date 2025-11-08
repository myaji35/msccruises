/*
  Warnings:

  - Added the required column `portType` to the `CruiseItinerary` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CruiseItinerary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cruiseId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "portType" TEXT NOT NULL,
    "port" TEXT NOT NULL,
    "portCode" TEXT,
    "country" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "arrival" TEXT,
    "departure" TEXT,
    "durationHours" INTEGER,
    "activities" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CruiseItinerary_cruiseId_fkey" FOREIGN KEY ("cruiseId") REFERENCES "Cruise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CruiseItinerary" ("activities", "arrival", "createdAt", "cruiseId", "day", "departure", "description", "id", "port", "updatedAt") SELECT "activities", "arrival", "createdAt", "cruiseId", "day", "departure", "description", "id", "port", "updatedAt" FROM "CruiseItinerary";
DROP TABLE "CruiseItinerary";
ALTER TABLE "new_CruiseItinerary" RENAME TO "CruiseItinerary";
CREATE INDEX "CruiseItinerary_cruiseId_idx" ON "CruiseItinerary"("cruiseId");
CREATE INDEX "CruiseItinerary_day_idx" ON "CruiseItinerary"("day");
CREATE INDEX "CruiseItinerary_portType_idx" ON "CruiseItinerary"("portType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
