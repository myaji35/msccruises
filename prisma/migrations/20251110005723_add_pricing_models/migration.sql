-- CreateTable
CREATE TABLE "PromotionCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "currency" TEXT DEFAULT 'USD',
    "description" TEXT,
    "validFrom" DATETIME NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "maxUsesPerUser" INTEGER DEFAULT 1,
    "minOrderAmount" REAL,
    "applicableCruises" TEXT,
    "applicableCategories" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cruiseId" TEXT NOT NULL,
    "cabinCategory" TEXT NOT NULL,
    "oldPrice" REAL NOT NULL,
    "newPrice" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "changeReason" TEXT NOT NULL,
    "changeDetails" TEXT,
    "changedBy" TEXT,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PricingRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" TEXT NOT NULL,
    "inventoryThresholdLow" INTEGER DEFAULT 30,
    "inventoryThresholdMedium" INTEGER DEFAULT 50,
    "inventoryThresholdHigh" INTEGER DEFAULT 70,
    "priceMultiplierLow" REAL DEFAULT 1.20,
    "priceMultiplierMedium" REAL DEFAULT 1.10,
    "priceMultiplierHigh" REAL DEFAULT 1.05,
    "demandMultiplierHigh" REAL DEFAULT 1.15,
    "demandMultiplierMedium" REAL DEFAULT 1.07,
    "demandMultiplierLow" REAL DEFAULT 1.00,
    "groupDiscount3to5" REAL DEFAULT 0.05,
    "groupDiscount6to10" REAL DEFAULT 0.10,
    "groupDiscount11plus" REAL DEFAULT 0.15,
    "applicableCruises" TEXT,
    "applicableCategories" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PromotionCode_code_key" ON "PromotionCode"("code");

-- CreateIndex
CREATE INDEX "PromotionCode_code_idx" ON "PromotionCode"("code");

-- CreateIndex
CREATE INDEX "PromotionCode_validFrom_validUntil_idx" ON "PromotionCode"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "PromotionCode_isActive_idx" ON "PromotionCode"("isActive");

-- CreateIndex
CREATE INDEX "PriceHistory_cruiseId_cabinCategory_idx" ON "PriceHistory"("cruiseId", "cabinCategory");

-- CreateIndex
CREATE INDEX "PriceHistory_changedAt_idx" ON "PriceHistory"("changedAt");

-- CreateIndex
CREATE INDEX "PriceHistory_changeReason_idx" ON "PriceHistory"("changeReason");

-- CreateIndex
CREATE INDEX "PricingRule_ruleType_idx" ON "PricingRule"("ruleType");

-- CreateIndex
CREATE INDEX "PricingRule_isActive_priority_idx" ON "PricingRule"("isActive", "priority");
