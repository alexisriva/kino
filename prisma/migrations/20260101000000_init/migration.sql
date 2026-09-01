-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL DEFAULT 'MOVIE',
    "releaseYear" INTEGER,
    "genre" TEXT,
    "director" TEXT,
    "cast" TEXT,
    "plot" TEXT,
    "posterUrl" TEXT,
    "imdbRating" TEXT,
    "userRating" REAL DEFAULT 5.0,
    "review" TEXT NOT NULL,
    "tags" TEXT,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "dislikesCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "voterHash" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL DEFAULT 'MOVIE',
    "releaseYear" INTEGER,
    "genre" TEXT,
    "director" TEXT,
    "cast" TEXT,
    "plot" TEXT,
    "posterUrl" TEXT,
    "imdbRating" TEXT,
    "isWatched" BOOLEAN NOT NULL DEFAULT false,
    "postId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WatchlistItem_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WatchRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL DEFAULT 'MOVIE',
    "releaseYear" INTEGER,
    "genre" TEXT,
    "director" TEXT,
    "cast" TEXT,
    "plot" TEXT,
    "posterUrl" TEXT,
    "imdbRating" TEXT,
    "requesterName" TEXT,
    "requesterNote" TEXT,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "requesterHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_postId_voterHash_key" ON "Vote"("postId", "voterHash");
