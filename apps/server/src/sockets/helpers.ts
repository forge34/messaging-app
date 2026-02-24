import { prisma } from "@chat/db/client";

export async function markMessagesAsRead(
  conversationId: string,
  userId: string,
) {
  const unreadMessages = await prisma.message.findMany({
    where: {
      conversationId: conversationId,
      authorId: { not: userId },
      status: { not: "READ" },
    },
    select: { id: true },
  });

  if (!unreadMessages.length) return [];

  const messageIds = unreadMessages.map((m) => m.id);

  await prisma.message.updateMany({
    where: {
      id: {
        in: messageIds,
      },
    },
    data: {
      status: "READ",
    },
  });

  await prisma.messageReceipt.createMany({
    data: messageIds.map((id) => ({
      messageId: id,
      userId: userId,
    })),
    skipDuplicates: true,
  });

  return messageIds || [];
}
