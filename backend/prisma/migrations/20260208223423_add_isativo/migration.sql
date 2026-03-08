-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('ENVIADO', 'PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'AGUARDANDO_DOCUMENTACAO', 'AGUARDANDO_PAGAMENTO');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('LIMPEZA_CPF', 'LIMPEZA_CNPJ', 'BACEN', 'REVISIONAL', 'BUSCA_CAPITAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'GESTOR';
ALTER TYPE "Role" ADD VALUE 'VENDEDOR';
ALTER TYPE "Role" ADD VALUE 'CLIENTE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "document" TEXT,
ADD COLUMN     "isAtivo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "region" TEXT;

-- CreateTable
CREATE TABLE "Process" (
    "id" TEXT NOT NULL,
    "type" "ServiceType" NOT NULL,
    "status" "ProcessStatus" NOT NULL DEFAULT 'ENVIADO',
    "description" TEXT,
    "setupFee" DOUBLE PRECISION NOT NULL DEFAULT 997.00,
    "debtValue" DOUBLE PRECISION,
    "totalFee" DOUBLE PRECISION,
    "clientId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "companyId" TEXT,
    "documents" JSONB,
    "sugestoes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Process_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "document" TEXT,
    "funnel" TEXT NOT NULL DEFAULT 'ORCAMENTO',
    "proposta" INTEGER,
    "notes" TEXT,
    "vendedorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Process_clientId_idx" ON "Process"("clientId");

-- CreateIndex
CREATE INDEX "Process_ownerId_idx" ON "Process"("ownerId");

-- CreateIndex
CREATE INDEX "Process_status_idx" ON "Process"("status");

-- CreateIndex
CREATE INDEX "CRMLead_vendedorId_idx" ON "CRMLead"("vendedorId");

-- CreateIndex
CREATE INDEX "CRMLead_funnel_idx" ON "CRMLead"("funnel");

-- CreateIndex
CREATE INDEX "User_parentId_idx" ON "User"("parentId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMLead" ADD CONSTRAINT "CRMLead_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
