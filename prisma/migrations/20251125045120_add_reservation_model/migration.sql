-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservationNumber" TEXT NOT NULL,
    "passportName" TEXT NOT NULL,
    "desiredDepartureDate" TEXT NOT NULL,
    "participants" TEXT NOT NULL,
    "preferredTour" TEXT,
    "additionalOptions" TEXT,
    "regularMedication" TEXT,
    "medicalConditions" TEXT,
    "preferredCabinType" TEXT NOT NULL,
    "specialMealRequests" TEXT,
    "mobilePhone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "kakaoTalkId" TEXT,
    "socialMediaAccount" TEXT,
    "additionalRequests" TEXT,
    "cruiseId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "processedBy" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_reservationNumber_key" ON "Reservation"("reservationNumber");

-- CreateIndex
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");

-- CreateIndex
CREATE INDEX "Reservation_cruiseId_idx" ON "Reservation"("cruiseId");

-- CreateIndex
CREATE INDEX "Reservation_email_idx" ON "Reservation"("email");

-- CreateIndex
CREATE INDEX "Reservation_submittedAt_idx" ON "Reservation"("submittedAt");
