import { prisma } from "@chat/db/client";
import {
  ClientEvents,
  ClientToServerEvents,
  OnlineUsers,
  PublicMessageSchema,
  type PublicUserSchema,
} from "@chat/shared";
import { io, ServerSocket } from "../server.js";
import { markMessagesAsRead } from "./helpers.js";

export function handleMessageReaction(
  user: PublicUserSchema,
  socket: ServerSocket,
): ClientToServerEvents["message:reaction"] {
  return async (...args) => {
    const data = ClientEvents["message:reaction"].input.parse(args);

    const [conversationId, messageId, emoji] = data;
    const message = await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        messageReactions: {
          upsert: {
            where: {
              messageId_userId: {
                messageId: messageId,
                userId: user.id,
              },
            },
            create: {
              emoji,
              userId: user.id,
            },
            update: { emoji },
          },
        },
      },
      include: {
        author: true,
        messageReactions: true,
        messageReceipts: true,
        parentMessage: {
          include: {
            author: true,
          },
        },
      },
    });

    socket.emit("message:reaction", conversationId, message);
  };
}

export function handleMessageCreate(
  user: PublicUserSchema,
  socket: ServerSocket,
): ClientToServerEvents["message:create"] {
  return async (...args) => {
    const data = ClientEvents["message:create"].input.parse(args);

    const [message, conversationId, tempId, parentMessageId] = data;
    const content = message.body.trim();
    if (!content) {
      return;
    }
    const createdMessage = await prisma.message.create({
      include: {
        author: true,
        parentMessage: {
          include: {
            author: true,
          },
        },
      },
      data: {
        body: content,
        conversationId: conversationId,
        authorId: user.id,
        status: "DELIVERED",
        deliveredAt: new Date().toISOString(),
        parentMessageId: parentMessageId ?? null,
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
      .emit("message:create", conversationId, newMessage);

    socket.emit("message:create:confirm", conversationId, newMessage, tempId);
    socket.to(conversationId).emit("typing:stop");
  };
}

export function handleMessageRead(
  user: PublicUserSchema,
  socket: ServerSocket,
): ClientToServerEvents["message:read"] {
  return async (...args) => {
    const data = ClientEvents["message:read"].input.parse(args);
    const [conversationId] = data;
    const messageIds = await markMessagesAsRead(conversationId, user.id);

    if (messageIds.length >= 0)
      socket
        .to(conversationId)
        .emit("message:read", conversationId, messageIds);
  };
}

export function handleDisconnect(
  user: PublicUserSchema,
  onlineId: OnlineUsers,
) {
  return () => {
    const timeout = setTimeout(async () => {
      onlineId.delete(user.id);

      io.emit("users:presence_update", Array.from(onlineId.keys()));

      await prisma.user.update({
        where: { id: user.id },
        data: { lastSeen: new Date().toISOString() },
      });
    }, 5000);

    onlineId.set(user.id, { isOnline: false, timerId: timeout });
  };
}
