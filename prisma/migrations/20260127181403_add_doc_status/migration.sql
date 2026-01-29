-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('PENDING', 'PROCESSING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "DocStatus" NOT NULL DEFAULT 'PENDING';
