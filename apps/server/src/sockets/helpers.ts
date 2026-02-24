import { prisma } from "@chat/db/client";

export async function markMessagesAsRead(
  conversationId: string,
  userId: string,
) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
    },
    include: {
      messages: true,
    },
  });

  if (!conversation) {
    return;
  }

  const unreadMessages = conversation.messages.filter(
    (m) => m.authorId !== userId && m.status !== "READ",
  );

  if (!unreadMessages.length) return;

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

  return messageIds;
}
