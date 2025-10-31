/*
  Warnings:

  - You are about to drop the `Subtasks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Subtasks" DROP CONSTRAINT "Subtasks_taskId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpires" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."Subtasks";
