-- Extends Task with the fields the Momentum design requires, and adds Category.
-- Spec: docs/design/01-concept-ia-navigation.md §2.1
--
-- `done` is replaced by `status`. Existing rows are carried over before the
-- column is dropped, so no completion state is lost.

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'slate',
    "icon" TEXT NOT NULL DEFAULT 'tag',

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AlterTable
ALTER TABLE "Task"
    ADD COLUMN "description" TEXT,
    ADD COLUMN "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    ADD COLUMN "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN "dueDate" DATE,
    ADD COLUMN "categoryId" INTEGER,
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "completedAt" TIMESTAMP(3);

-- `updatedAt` is maintained by Prisma's @updatedAt, which does not create a
-- database default. The default is used only to backfill existing rows, then
-- dropped so the database matches the Prisma schema and no drift is reported.
ALTER TABLE "Task" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Task" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Data migration: carry `done` over to `status` before dropping the column.
UPDATE "Task"
    SET "status" = 'DONE',
        "completedAt" = CURRENT_TIMESTAMP
    WHERE "done" = true;

-- DropColumn
ALTER TABLE "Task" DROP COLUMN "done";

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE INDEX "Task_categoryId_idx" ON "Task"("categoryId");

-- AddForeignKey
-- ON DELETE SET NULL implements the default answer when a category is deleted:
-- its tasks move to Uncategorized rather than being destroyed.
ALTER TABLE "Task" ADD CONSTRAINT "Task_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
