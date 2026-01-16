/*
  Warnings:

  - You are about to drop the `Documento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EstadoProveedorLey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ley` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LogAuditoria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Minera` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Proveedor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequisitoLegal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Validacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProviderGeneralStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "LawScope" AS ENUM ('PROVINCIAL', 'NATIONAL');

-- CreateEnum
CREATE TYPE "RequirementType" AS ENUM ('DOCUMENTARY', 'LOGICAL', 'TECHNICAL');

-- CreateEnum
CREATE TYPE "ValidationResult" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProviderLawStatus" AS ENUM ('APPROVED', 'REJECTED', 'OBSERVED');

-- CreateEnum
CREATE TYPE "ValidatorType" AS ENUM ('SYSTEM', 'USER');

-- DropForeignKey
ALTER TABLE "Documento" DROP CONSTRAINT "Documento_proveedorId_fkey";

-- DropForeignKey
ALTER TABLE "Documento" DROP CONSTRAINT "Documento_requisitoLegalId_fkey";

-- DropForeignKey
ALTER TABLE "EstadoProveedorLey" DROP CONSTRAINT "EstadoProveedorLey_leyId_fkey";

-- DropForeignKey
ALTER TABLE "EstadoProveedorLey" DROP CONSTRAINT "EstadoProveedorLey_proveedorId_fkey";

-- DropForeignKey
ALTER TABLE "RequisitoLegal" DROP CONSTRAINT "RequisitoLegal_leyId_fkey";

-- DropForeignKey
ALTER TABLE "Validacion" DROP CONSTRAINT "Validacion_documentoId_fkey";

-- DropTable
DROP TABLE "Documento";

-- DropTable
DROP TABLE "EstadoProveedorLey";

-- DropTable
DROP TABLE "Ley";

-- DropTable
DROP TABLE "LogAuditoria";

-- DropTable
DROP TABLE "Minera";

-- DropTable
DROP TABLE "Proveedor";

-- DropTable
DROP TABLE "RequisitoLegal";

-- DropTable
DROP TABLE "Validacion";

-- DropEnum
DROP TYPE "AmbitoLey";

-- DropEnum
DROP TYPE "EstadoGeneralProveedor";

-- DropEnum
DROP TYPE "EstadoLeyProveedor";

-- DropEnum
DROP TYPE "ResultadoValidacion";

-- DropEnum
DROP TYPE "TipoRequisito";

-- DropEnum
DROP TYPE "Validador";

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "mainActivity" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "generalStatus" "ProviderGeneralStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MiningCompany" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MiningCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Law" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scope" "LawScope" NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Law_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "lawId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "RequirementType" NOT NULL,
    "isMandatory" BOOLEAN NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Validation" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "technicalResult" "ValidationResult" NOT NULL,
    "logicalResult" "ValidationResult" NOT NULL,
    "regulatoryResult" "ValidationResult" NOT NULL,
    "notes" TEXT NOT NULL,
    "validatedBy" "ValidatorType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Validation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderLawStatusEntity" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "lawId" TEXT NOT NULL,
    "status" "ProviderLawStatus" NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderLawStatusEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_cuit_key" ON "Provider"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "MiningCompany_cuit_key" ON "MiningCompany"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderLawStatusEntity_providerId_lawId_key" ON "ProviderLawStatusEntity"("providerId", "lawId");

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_lawId_fkey" FOREIGN KEY ("lawId") REFERENCES "Law"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderLawStatusEntity" ADD CONSTRAINT "ProviderLawStatusEntity_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderLawStatusEntity" ADD CONSTRAINT "ProviderLawStatusEntity_lawId_fkey" FOREIGN KEY ("lawId") REFERENCES "Law"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
