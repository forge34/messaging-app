import { Message, User } from "@chat/db";
import { Socket } from "socket.io";
import { prisma } from "@chat/db";
import { io } from "../server";

export const handleMessageCreate =
  (user: User, socket: Socket) =>
  async (message: Message, conversationId: string, tempId: string) => {
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

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        users: true,
      },
    });
    const otherUser = conversation?.users.find((u) => u.id !== user.id);

    socket.to(`user:${otherUser.id}`).emit("message:create", createdMessage);
    socket.emit(
      "message:create:confirm",
      createdMessage,
      conversationId,
      tempId,
    );
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
