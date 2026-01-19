/*
  Warnings:

  - You are about to drop the column `type` on the `Conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "type";

-- DropEnum
DROP TYPE "ConversationType";
