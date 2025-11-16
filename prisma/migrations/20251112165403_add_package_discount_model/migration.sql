-- CreateTable
CREATE TABLE "PackageDiscount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" REAL NOT NULL,
    "maxDiscountAmount" REAL,
    "minOrderAmount" REAL,
    "benefits" TEXT,
    "conditions" TEXT,
    "applicableTo" TEXT,
    "displayText" TEXT,
    "validFrom" DATETIME NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PackageDiscount_code_key" ON "PackageDiscount"("code");

-- CreateIndex
CREATE INDEX "PackageDiscount_isActive_priority_idx" ON "PackageDiscount"("isActive", "priority");

-- CreateIndex
CREATE INDEX "PackageDiscount_code_idx" ON "PackageDiscount"("code");

-- CreateIndex
CREATE INDEX "PackageDiscount_validFrom_validUntil_idx" ON "PackageDiscount"("validFrom", "validUntil");
