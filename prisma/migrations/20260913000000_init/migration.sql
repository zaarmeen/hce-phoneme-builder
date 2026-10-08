-- CreateTable
CREATE TABLE "activity_sets" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    "maxGuesses" INTEGER,
    "rows" INTEGER,
    "cols" INTEGER,
    "showHints" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "words" (
    "id" SERIAL NOT NULL,
    "activitySetId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "hint" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phonemes" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "phonemes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "words_activitySetId_idx" ON "words"("activitySetId");

-- CreateIndex
CREATE INDEX "phonemes_wordId_idx" ON "phonemes"("wordId");

-- AddForeignKey
ALTER TABLE "words" ADD CONSTRAINT "words_activitySetId_fkey" FOREIGN KEY ("activitySetId") REFERENCES "activity_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phonemes" ADD CONSTRAINT "phonemes_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;
