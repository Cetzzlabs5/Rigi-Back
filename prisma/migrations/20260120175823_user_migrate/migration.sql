/*
  Warnings:

  - You are about to drop the column `contactEmail` on the `MiningCompany` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `MiningCompany` table. All the data in the column will be lost.
  - You are about to drop the column `cuit` on the `MiningCompany` table. All the data in the column will be lost.
  - You are about to drop the column `legalName` on the `MiningCompany` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `cuit` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `legalName` on the `Provider` table. All the data in the column will be lost.
  - Added the required column `userId` to the `MiningCompany` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Provider` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PROVIDER', 'MINING_COMPANY');

-- DropIndex
DROP INDEX "MiningCompany_cuit_key";

-- DropIndex
DROP INDEX "Provider_cuit_key";

-- AlterTable
ALTER TABLE "MiningCompany" DROP COLUMN "contactEmail",
DROP COLUMN "createdAt",
DROP COLUMN "cuit",
DROP COLUMN "legalName",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "contactEmail",
DROP COLUMN "cuit",
DROP COLUMN "legalName",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cuit_key" ON "User"("cuit");

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MiningCompany" ADD CONSTRAINT "MiningCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
