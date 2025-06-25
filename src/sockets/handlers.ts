import { Message, User } from "@prisma/client";
import { Socket } from "socket.io";
import { prisma } from "../config/prisma-client";

export const handleMessageCreate =
  (user: User, socket: Socket) =>
  async (message: Message, conversationId: string) => {
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
    socket.emit("message:confirm", createdMessage);
  };
