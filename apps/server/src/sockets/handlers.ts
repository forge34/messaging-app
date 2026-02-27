import { prisma } from "@chat/db/client";
import {
  ClientToServerEvents,
  OnlineUsers,
  PublicMessageSchema,
  type PublicUserSchema,
} from "@chat/shared";
import { io, ServerSocket } from "../server.js";
import { markMessagesAsRead } from "./helpers.js";
import { logger } from "../lib/logger.js";
import { DisconnectReason } from "socket.io";


export function handleMessageReaction(
  user: PublicUserSchema,
): ClientToServerEvents["message:reaction"] {
  return async (...args) => {
    const [conversationId, messageId, emoji] = args;
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

    io.to(conversationId).emit("message:reaction", conversationId, message);
  };
}

export function handleMessageCreate(
  user: PublicUserSchema,
  socket: ServerSocket,
): ClientToServerEvents["message:create"] {
  return async (...args) => {
    const [message, conversationId, tempId, parentMessageId] = args;
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
    const [conversationId] = args;
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
  socket: ServerSocket,
) {
  return (reason: DisconnectReason) => {
    logger.info({
      socketId: socket.id,
      msg: "Socket disconnected",
      userName: user.name,
      reason,
    });
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
