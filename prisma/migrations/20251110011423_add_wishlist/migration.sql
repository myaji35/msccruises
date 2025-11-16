-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cruiseId" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "priceAlert" BOOLEAN NOT NULL DEFAULT false,
    "targetPrice" REAL
);

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "Wishlist"("userId");

-- CreateIndex
CREATE INDEX "Wishlist_cruiseId_idx" ON "Wishlist"("cruiseId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_cruiseId_key" ON "Wishlist"("userId", "cruiseId");
