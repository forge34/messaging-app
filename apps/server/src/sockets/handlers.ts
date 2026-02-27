import { prisma } from "@chat/db/client";
import {
  ClientToServerEvents,
  PublicMessageSchema,
  type PublicUserSchema,
} from "@chat/shared";
import { io, onlineId, OnlineUsers, ServerSocket } from "../server.js";
import { markMessagesAsRead } from "./helpers.js";
import { logger } from "../lib/logger.js";
import { DisconnectReason } from "socket.io";

export function handleConversationCreate(
  user: PublicUserSchema,
  socket: ServerSocket,
): ClientToServerEvents["conversation:create"] {
  return async (...args) => {
    const [otherId] = args;

    if (user.id === otherId) return;

    const otherUser = await prisma.user.findUnique({ where: { id: otherId } });
    if (!otherUser) return;

    let conversation = await prisma.conversation.findFirst({
      where: {
        users: {
          every: {
            id: { in: [user.id, otherId] },
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          select: {
            id: true,
            body: true,
            authorId: true,
            conversationId: true,
            status: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                bio: true,
                name: true,
                imgUrl: true,
              },
            },
            bookmarkedBy: true,
            messageReceipts: true,
            messageReactions: true,
            parentMessageId: true,
            parentMessage: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    imgUrl: true,
                    bio: true,
                  },
                },
              },
            },
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            imgUrl: true,
            bio: true,
            lastSeen: true,
          },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          users: {
            connect: [{ id: user.id }, { id: otherId }],
          },
        },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          messages: {
            select: {
              id: true,
              body: true,
              authorId: true,
              conversationId: true,
              status: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  bio: true,
                  name: true,
                  imgUrl: true,
                },
              },
              bookmarkedBy: true,
              messageReceipts: true,
              messageReactions: true,
              parentMessageId: true,
              parentMessage: {
                include: {
                  author: {
                    select: {
                      id: true,
                      name: true,
                      imgUrl: true,
                      bio: true,
                    },
                  },
                },
              },
            },
          },
          users: {
            select: {
              id: true,
              name: true,
              imgUrl: true,
              bio: true,
              lastSeen: true,
            },
          },
        },
      });
    }

    const mappedMessages = conversation.messages
      .map(
        ({
          id,
          authorId,
          author,
          status,
          createdAt,
          conversationId,
          bookmarkedBy,
          body,
          messageReactions,
          messageReceipts,
          parentMessageId,
          parentMessage,
        }) => {
          return {
            messageReactions,
            messageReceipts,
            id,
            body,
            author,
            authorId,
            status,
            createdAt,
            conversationId,
            parentMessage,
            parentMessageId,
            isMine: authorId === user.id,
            isBookmarked:
              bookmarkedBy.findIndex(({ id }) => id === user.id) >= 0
                ? true
                : false,
          };
        },
      )
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    const mapped = {
      ...conversation,
      messages: mappedMessages,
      title: otherUser.name ?? "Conversation",
      lastSeen: otherUser.lastSeen ?? undefined,
    };

    socket.join(conversation.id);
    const otherSocket = onlineId.get(otherUser.id);

    if (otherSocket) {
      otherSocket.socket.join(conversation.id);
    }
    console.log(conversation);
    socket.emit("conversation:create", mapped);
  };
}
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

    onlineId.set(user.id, { isOnline: false, timerId: timeout, socket });
  };
}
