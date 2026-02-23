import { Message, User } from "@chat/db/client";
import { Socket } from "socket.io";
import { prisma } from "@chat/db/client";
import { io } from "../server.js";
import { PublicMessageSchema } from "@chat/shared";

export const handleMessageCreate =
  (user: User, socket: Socket) =>
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
  (user: User, socket: Socket) => async (conversationId: string) => {
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

    const messages = conversation.messages.filter(
      (m) => m.authorId !== user.id && m.status !== "READ",
    );

    if (!messages.length) return;

    await prisma.message.updateMany({
      where: {
        id: {
          in: messages.map((m) => m.id),
        },
      },
      data: {
        status: "READ",
      },
    });

    await prisma.messageReceipt.createMany({
      data: messages.map((m) => ({
        messageId: m.id,
        userId: user.id,
      })),
      skipDuplicates: true,
    });

    socket.to(conversationId).emit("message:read");
  };

export const handleMessageDelete =
  (socket: Socket) => async (message: Message, conversationId: string) => {
    await prisma.message.delete({
      where: {
        id: message.id,
      },
    });

    io.emit("message:delete:confirm", conversationId);
  };
