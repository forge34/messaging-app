import { prisma } from "@chat/db/client";
import { beforeEach } from "vitest";

const resetDB = async () => {
  await prisma.$transaction([
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};

beforeEach(async () => {
  await resetDB();
});
