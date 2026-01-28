/*
  Warnings:

  - You are about to drop the column `fileHash` on the `Document` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hash]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hash` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "fileHash",
ADD COLUMN     "hash" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Document_hash_key" ON "Document"("hash");
