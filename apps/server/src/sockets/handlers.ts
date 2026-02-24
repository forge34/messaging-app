import { prisma } from "@chat/db/client";
import { PublicMessageSchema, PublicUserSchema } from "@chat/shared";
import { ServerSocket } from "../server.js";

export const handleMessageCreate =
  (user: PublicUserSchema, socket: ServerSocket) =>
  async (
    message: PublicMessageSchema,
    conversationId: string,
    tempId: string,
  ) => {
    const content = message.body.trim();
    if (!content) {
      return;
    }

    const createdMessage = await prisma.message.create({
      include: {
        author: true,
      },
      data: {
        body: content,
        conversationId: conversationId,
        authorId: user.id,
        status: "DELIVERED",
      },
    });

    const newMessage: Partial<PublicMessageSchema> = {
      ...createdMessage,
      clientId: tempId,
    };

    socket.broadcast
      .to(conversationId)
      .emit("message:create", newMessage, conversationId);

    socket.emit("message:create:confirm", conversationId, newMessage, tempId);
  };

export const handleMessageRead =
  (user: PublicUserSchema, socket: ServerSocket) =>
  async (conversationId: string) => {
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
      (m) => m.authorId !== user.id && m.status !== "READ",
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
      data: unreadMessages.map((m) => ({
        messageId: m.id,
        userId: user.id,
      })),
      skipDuplicates: true,
    });

    socket.to(conversationId).emit("message:read", conversationId, messageIds);
  };

export const handleMessageDelete = async (
  messageId: string,
  conversationId: string,
) => {
  await prisma.message.delete({
    where: {
      id: messageId,
    },
  });
  console.log(conversationId);
  // io.emit("message:delete:confirm", conversationId);
};
