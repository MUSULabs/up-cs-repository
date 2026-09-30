ALTER TYPE "PaperStatus" ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE "PaperStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TABLE "Paper"
  ADD COLUMN "submittedById" TEXT,
  ADD COLUMN "submittedAt" TIMESTAMP(3),
  ADD COLUMN "reviewedById" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3),
  ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "Paper"
  ADD CONSTRAINT "Paper_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "Paper_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Paper_submittedById_idx" ON "Paper"("submittedById");
CREATE INDEX "Paper_reviewedById_idx" ON "Paper"("reviewedById");
