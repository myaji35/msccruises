-- AlterTable
ALTER TABLE "SnsAccount" ADD COLUMN "accountName" TEXT;

-- CreateTable
CREATE TABLE "SnsAutoPostRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "contentType" TEXT NOT NULL,
    "snsAccountId" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "hashtagTemplate" TEXT,
    "postImmediately" BOOLEAN NOT NULL DEFAULT false,
    "scheduleDelayMinutes" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SnsAutoPostRule_snsAccountId_fkey" FOREIGN KEY ("snsAccountId") REFERENCES "SnsAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SnsPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentType" TEXT NOT NULL DEFAULT 'cruise',
    "contentId" TEXT,
    "snsAccountId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT,
    "hashtags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduledAt" DATETIME,
    "postedAt" DATETIME,
    "platformPostId" TEXT,
    "errorMessage" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "cruiseId" TEXT,
    CONSTRAINT "SnsPost_cruiseId_fkey" FOREIGN KEY ("cruiseId") REFERENCES "Cruise" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SnsPost_snsAccountId_fkey" FOREIGN KEY ("snsAccountId") REFERENCES "SnsAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SnsPost" ("content", "createdAt", "createdBy", "cruiseId", "errorMessage", "hashtags", "id", "mediaUrls", "platform", "platformPostId", "postedAt", "scheduledAt", "snsAccountId", "status", "updatedAt") SELECT "content", "createdAt", "createdBy", "cruiseId", "errorMessage", "hashtags", "id", "mediaUrls", "platform", "platformPostId", "postedAt", "scheduledAt", "snsAccountId", "status", "updatedAt" FROM "SnsPost";
DROP TABLE "SnsPost";
ALTER TABLE "new_SnsPost" RENAME TO "SnsPost";
CREATE INDEX "SnsPost_contentType_contentId_idx" ON "SnsPost"("contentType", "contentId");
CREATE INDEX "SnsPost_cruiseId_idx" ON "SnsPost"("cruiseId");
CREATE INDEX "SnsPost_snsAccountId_idx" ON "SnsPost"("snsAccountId");
CREATE INDEX "SnsPost_status_idx" ON "SnsPost"("status");
CREATE INDEX "SnsPost_scheduledAt_idx" ON "SnsPost"("scheduledAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SnsAutoPostRule_contentType_idx" ON "SnsAutoPostRule"("contentType");

-- CreateIndex
CREATE INDEX "SnsAutoPostRule_snsAccountId_idx" ON "SnsAutoPostRule"("snsAccountId");

-- CreateIndex
CREATE INDEX "SnsAutoPostRule_isActive_idx" ON "SnsAutoPostRule"("isActive");

-- CreateIndex
CREATE INDEX "SnsAccount_platform_idx" ON "SnsAccount"("platform");
