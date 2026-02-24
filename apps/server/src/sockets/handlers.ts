import { prisma } from "@chat/db/client";
import { PublicMessageSchema, PublicUserSchema } from "@chat/shared";
import { ServerSocket } from "../server.js";
import { markMessagesAsRead } from "./helpers.js";

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

    const messageIds = await markMessagesAsRead(conversationId, user.id);

    if (messageIds.length >= 0)
      socket
        .to(conversationId)
        .emit("message:read", conversationId, messageIds);

    socket.broadcast
      .to(conversationId)
      .emit("message:create", newMessage, conversationId);

    socket.emit("message:create:confirm", conversationId, newMessage, tempId);
  };

export const handleMessageRead =
  (user: PublicUserSchema, socket: ServerSocket) =>
  async (conversationId: string) => {
    const messageIds = await markMessagesAsRead(conversationId, user.id);

    if (messageIds.length >= 0)
      socket
        .to(conversationId)
        .emit("message:read", conversationId, messageIds);
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
