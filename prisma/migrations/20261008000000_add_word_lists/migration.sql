-- Reusable word lists: words move from belonging to one activity set to belonging
-- to a word list, and activity sets point at a word list instead.

-- CreateTable
CREATE TABLE "word_lists" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "word_lists_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "activity_sets" ADD COLUMN "wordListId" INTEGER;

-- AlterTable
ALTER TABLE "words" ADD COLUMN "wordListId" INTEGER;

-- Data migration: give every existing activity set its own word list holding the
-- words it already had, so no data is lost. Reusing the activity set's id as the
-- new list's id keeps the mapping simple; the sequence is then moved past them.
INSERT INTO "word_lists" ("id", "title", "createdAt", "updatedAt")
SELECT "id", "title", "createdAt", CURRENT_TIMESTAMP FROM "activity_sets";

SELECT setval(
    pg_get_serial_sequence('"word_lists"', 'id'),
    COALESCE((SELECT MAX("id") FROM "word_lists"), 0) + 1,
    false
);

UPDATE "activity_sets" SET "wordListId" = "id";
UPDATE "words" SET "wordListId" = "activitySetId";

-- DropForeignKey
ALTER TABLE "words" DROP CONSTRAINT "words_activitySetId_fkey";

-- DropIndex
DROP INDEX "words_activitySetId_idx";

-- AlterTable
ALTER TABLE "words" DROP COLUMN "activitySetId",
ALTER COLUMN "wordListId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "activity_sets_wordListId_idx" ON "activity_sets"("wordListId");

-- CreateIndex
CREATE INDEX "words_wordListId_idx" ON "words"("wordListId");

-- AddForeignKey
ALTER TABLE "activity_sets" ADD CONSTRAINT "activity_sets_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "word_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "words" ADD CONSTRAINT "words_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "word_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
