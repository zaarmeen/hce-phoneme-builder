-- CreateTable
CREATE TABLE "activity_sets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    "maxGuesses" INTEGER,
    "rows" INTEGER,
    "cols" INTEGER,
    "showHints" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "words" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activitySetId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "hint" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "words_activitySetId_fkey" FOREIGN KEY ("activitySetId") REFERENCES "activity_sets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "phonemes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wordId" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "phonemes_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "words_activitySetId_idx" ON "words"("activitySetId");

-- CreateIndex
CREATE INDEX "phonemes_wordId_idx" ON "phonemes"("wordId");
