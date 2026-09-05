-- Atria Intelligence & Discovery Layer migration
-- Run this against your production PostgreSQL database (Neon/Turso)

-- Product discovery metadata
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "useCases" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "intents" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "aiKeywords" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "aiSummary" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "atriaPickReason" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "giftable" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "budgetSegment" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "discoveryTags" TEXT NOT NULL DEFAULT '[]';

CREATE TABLE IF NOT EXISTS "Drop" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL DEFAULT '',
  "shortDescription" TEXT NOT NULL DEFAULT '',
  "coverImage" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "startAt" TIMESTAMP,
  "endAt" TIMESTAMP,
  "publishedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "DropProduct" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "dropId" TEXT NOT NULL REFERENCES "Drop"("id") ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  UNIQUE("dropId", "productId")
);

CREATE TABLE IF NOT EXISTS "Find" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL DEFAULT '',
  "shortDescription" TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "FindProduct" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "findId" TEXT NOT NULL REFERENCES "Find"("id") ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  UNIQUE("findId", "productId")
);

CREATE TABLE IF NOT EXISTS "Collection" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL DEFAULT '',
  "shortDescription" TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "startAt" TIMESTAMP,
  "endAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CollectionProduct" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "collectionId" TEXT NOT NULL REFERENCES "Collection"("id") ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  UNIQUE("collectionId", "productId")
);

CREATE TABLE IF NOT EXISTS "RelatedProduct" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fromProductId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "toProductId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL DEFAULT 'RELATED',
  UNIQUE("fromProductId", "toProductId")
);

CREATE TABLE IF NOT EXISTS "AIQuery" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT,
  "userId" TEXT,
  "query" TEXT NOT NULL,
  "intent" TEXT,
  "budgetMin" INTEGER,
  "budgetMax" INTEGER,
  "resultCount" INTEGER NOT NULL DEFAULT 0,
  "clickedProductId" TEXT,
  "addedToCartProductId" TEXT,
  "metadata" TEXT NOT NULL DEFAULT '{}',
  "productId" TEXT REFERENCES "Product"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Recommendation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "sessionId" TEXT,
  "productId" TEXT NOT NULL REFERENCES "Product"("id"),
  "source" TEXT NOT NULL DEFAULT 'manual',
  "score" INTEGER NOT NULL DEFAULT 0,
  "clicked" BOOLEAN NOT NULL DEFAULT FALSE,
  "addedToCart" BOOLEAN NOT NULL DEFAULT FALSE,
  "purchased" BOOLEAN NOT NULL DEFAULT FALSE,
  "feedback" TEXT,
  "metadata" TEXT NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "RecommendationFeedback" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "recommendationId" TEXT NOT NULL REFERENCES "Recommendation"("id") ON DELETE CASCADE,
  "userId" TEXT,
  "helpful" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Drop_slug_idx" ON "Drop"("slug");
CREATE INDEX IF NOT EXISTS "Find_slug_idx" ON "Find"("slug");
CREATE INDEX IF NOT EXISTS "Collection_slug_idx" ON "Collection"("slug");
CREATE INDEX IF NOT EXISTS "AIQuery_createdAt_idx" ON "AIQuery"("createdAt");
CREATE INDEX IF NOT EXISTS "Recommendation_createdAt_idx" ON "Recommendation"("createdAt");
