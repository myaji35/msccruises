-- CreateTable
CREATE TABLE "CabinCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "description" TEXT,
    "features" TEXT,
    "priceMultiplier" REAL NOT NULL DEFAULT 1.0,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CruiseExtra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "description" TEXT,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "category" TEXT NOT NULL,
    "features" TEXT,
    "imageUrl" TEXT,
    "maxPerBooking" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "region" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CabinCategory_code_key" ON "CabinCategory"("code");

-- CreateIndex
CREATE INDEX "CabinCategory_isActive_order_idx" ON "CabinCategory"("isActive", "order");

-- CreateIndex
CREATE INDEX "CabinCategory_code_idx" ON "CabinCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CruiseExtra_code_key" ON "CruiseExtra"("code");

-- CreateIndex
CREATE INDEX "CruiseExtra_isActive_category_order_idx" ON "CruiseExtra"("isActive", "category", "order");

-- CreateIndex
CREATE INDEX "CruiseExtra_code_idx" ON "CruiseExtra"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Destination_code_key" ON "Destination"("code");

-- CreateIndex
CREATE INDEX "Destination_isActive_order_idx" ON "Destination"("isActive", "order");

-- CreateIndex
CREATE INDEX "Destination_code_idx" ON "Destination"("code");
