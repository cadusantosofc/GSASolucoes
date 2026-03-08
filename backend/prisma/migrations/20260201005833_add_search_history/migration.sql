-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "moduleSlug" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL,
    "baseName" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "result" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "companyName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedLink" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "searchHistoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");

-- CreateIndex
CREATE INDEX "SearchHistory_companyId_idx" ON "SearchHistory"("companyId");

-- CreateIndex
CREATE INDEX "SearchHistory_createdAt_idx" ON "SearchHistory"("createdAt");

-- CreateIndex
CREATE INDEX "SearchHistory_moduleSlug_idx" ON "SearchHistory"("moduleSlug");

-- CreateIndex
CREATE UNIQUE INDEX "SharedLink_token_key" ON "SharedLink"("token");

-- CreateIndex
CREATE INDEX "SharedLink_token_idx" ON "SharedLink"("token");

-- CreateIndex
CREATE INDEX "SharedLink_expiresAt_idx" ON "SharedLink"("expiresAt");

-- CreateIndex
CREATE INDEX "SharedLink_searchHistoryId_idx" ON "SharedLink"("searchHistoryId");

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedLink" ADD CONSTRAINT "SharedLink_searchHistoryId_fkey" FOREIGN KEY ("searchHistoryId") REFERENCES "SearchHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
