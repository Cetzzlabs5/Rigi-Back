/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoGeneralProveedor" AS ENUM ('ACTIVO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "AmbitoLey" AS ENUM ('PROVINCIAL', 'NACIONAL');

-- CreateEnum
CREATE TYPE "TipoRequisito" AS ENUM ('DOCUMENTAL', 'LOGICO', 'TECNICO');

-- CreateEnum
CREATE TYPE "ResultadoValidacion" AS ENUM ('APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "EstadoLeyProveedor" AS ENUM ('APROBADO', 'RECHAZADO', 'OBSERVADO');

-- CreateEnum
CREATE TYPE "Validador" AS ENUM ('SISTEMA', 'USUARIO');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "rubroPrincipal" TEXT NOT NULL,
    "emailContacto" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "estadoGeneral" "EstadoGeneralProveedor" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Minera" (
    "id" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "emailContacto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Minera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ley" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "ambito" "AmbitoLey" NOT NULL,
    "activa" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ley_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequisitoLegal" (
    "id" TEXT NOT NULL,
    "leyId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" "TipoRequisito" NOT NULL,
    "obligatorio" BOOLEAN NOT NULL,

    CONSTRAINT "RequisitoLegal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "requisitoLegalId" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "hashArchivo" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Validacion" (
    "id" TEXT NOT NULL,
    "documentoId" TEXT NOT NULL,
    "resultadoTecnico" "ResultadoValidacion" NOT NULL,
    "resultadoLogico" "ResultadoValidacion" NOT NULL,
    "resultadoNormativo" "ResultadoValidacion" NOT NULL,
    "observaciones" TEXT NOT NULL,
    "validadoPor" "Validador" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Validacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadoProveedorLey" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "leyId" TEXT NOT NULL,
    "estado" "EstadoLeyProveedor" NOT NULL,
    "fechaRevision" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstadoProveedorLey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogAuditoria" (
    "id" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "detalle" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_cuit_key" ON "Proveedor"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "Minera_cuit_key" ON "Minera"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "EstadoProveedorLey_proveedorId_leyId_key" ON "EstadoProveedorLey"("proveedorId", "leyId");

-- AddForeignKey
ALTER TABLE "RequisitoLegal" ADD CONSTRAINT "RequisitoLegal_leyId_fkey" FOREIGN KEY ("leyId") REFERENCES "Ley"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_requisitoLegalId_fkey" FOREIGN KEY ("requisitoLegalId") REFERENCES "RequisitoLegal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validacion" ADD CONSTRAINT "Validacion_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "Documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstadoProveedorLey" ADD CONSTRAINT "EstadoProveedorLey_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstadoProveedorLey" ADD CONSTRAINT "EstadoProveedorLey_leyId_fkey" FOREIGN KEY ("leyId") REFERENCES "Ley"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
