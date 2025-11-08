-- CreateTable
CREATE TABLE "SnsAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SnsAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SnsPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cruiseId" TEXT NOT NULL,
    "snsAccountId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT,
    "hashtags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "scheduledAt" DATETIME NOT NULL,
    "postedAt" DATETIME,
    "platformPostId" TEXT,
    "errorMessage" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SnsPost_cruiseId_fkey" FOREIGN KEY ("cruiseId") REFERENCES "Cruise" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SnsPost_snsAccountId_fkey" FOREIGN KEY ("snsAccountId") REFERENCES "SnsAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SnsAccount_userId_idx" ON "SnsAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SnsAccount_userId_platform_accountId_key" ON "SnsAccount"("userId", "platform", "accountId");

-- CreateIndex
CREATE INDEX "SnsPost_cruiseId_idx" ON "SnsPost"("cruiseId");

-- CreateIndex
CREATE INDEX "SnsPost_snsAccountId_idx" ON "SnsPost"("snsAccountId");

-- CreateIndex
CREATE INDEX "SnsPost_status_idx" ON "SnsPost"("status");

-- CreateIndex
CREATE INDEX "SnsPost_scheduledAt_idx" ON "SnsPost"("scheduledAt");
