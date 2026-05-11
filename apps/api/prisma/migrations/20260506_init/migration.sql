-- CreateEnum
CREATE TYPE "TestVersion" AS ENUM ('lite', 'full');

-- CreateEnum
CREATE TYPE "MatchContext" AS ENUM ('work', 'friend', 'love', 'family');

-- CreateEnum
CREATE TYPE "CardFormat" AS ENUM ('square', 'story', 'talk');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_sessions" (
    "id" TEXT NOT NULL,
    "version" "TestVersion" NOT NULL,
    "responses" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "ipMasked" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,

    CONSTRAINT "response_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "version" "TestVersion" NOT NULL,
    "mainPattern" TEXT NOT NULL,
    "subPattern" TEXT,
    "displayCode" TEXT NOT NULL,
    "matches" JSONB NOT NULL,
    "facets" JSONB NOT NULL,
    "dimensions" JSONB NOT NULL,
    "auxiliary" JSONB NOT NULL,
    "stressPatterns" JSONB NOT NULL,
    "quality" JSONB NOT NULL,
    "riskSignals" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_cards" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "format" "CardFormat" NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_records" (
    "id" TEXT NOT NULL,
    "tokenAId" TEXT NOT NULL,
    "tokenBId" TEXT NOT NULL,
    "context" "MatchContext" NOT NULL,
    "outcome" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "match_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "response_sessions_userId_idx" ON "response_sessions"("userId");

-- CreateIndex
CREATE INDEX "response_sessions_startedAt_idx" ON "response_sessions"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "results_token_key" ON "results"("token");

-- CreateIndex
CREATE UNIQUE INDEX "results_sessionId_key" ON "results"("sessionId");

-- CreateIndex
CREATE INDEX "results_userId_idx" ON "results"("userId");

-- CreateIndex
CREATE INDEX "results_createdAt_idx" ON "results"("createdAt");

-- CreateIndex
CREATE INDEX "shared_cards_resultId_idx" ON "shared_cards"("resultId");

-- CreateIndex
CREATE INDEX "match_records_tokenAId_idx" ON "match_records"("tokenAId");

-- CreateIndex
CREATE INDEX "match_records_tokenBId_idx" ON "match_records"("tokenBId");

-- CreateIndex
CREATE INDEX "match_records_createdAt_idx" ON "match_records"("createdAt");

-- AddForeignKey
ALTER TABLE "response_sessions" ADD CONSTRAINT "response_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "response_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_cards" ADD CONSTRAINT "shared_cards_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_records" ADD CONSTRAINT "match_records_tokenAId_fkey" FOREIGN KEY ("tokenAId") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_records" ADD CONSTRAINT "match_records_tokenBId_fkey" FOREIGN KEY ("tokenBId") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

