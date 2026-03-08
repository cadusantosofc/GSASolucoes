-- AlterTable
ALTER TABLE "Base" ADD COLUMN     "bodyParams" JSONB,
ADD COLUMN     "headers" JSONB,
ADD COLUMN     "method" TEXT NOT NULL DEFAULT 'GET';
