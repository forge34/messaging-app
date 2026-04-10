import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TypedServer, TypedSocket } from './chat.gateway';
import { User } from '@chat/db/client';
import { PublicMessageSchema, PublicUserSchema } from '@chat/shared';

type OnlineEntry = {
  socket: TypedSocket;
  isOnline: boolean;
  timerId: NodeJS.Timeout | null;
};

@Injectable()
export class ChatService {
  private onlineUsers = new Map<string, OnlineEntry>();

  constructor(private readonly prisma: PrismaService) {}
  private async markMessagesAsRead(conversationId: string, userId: string) {
    const unreadMessages = await this.prisma.message.findMany({
      where: {
        conversationId: conversationId,
        authorId: { not: userId },
        status: { not: 'READ' },
      },
      select: { id: true },
    });

    if (!unreadMessages.length) return [];

    const messageIds = unreadMessages.map((m) => m.id);

    await this.prisma.message.updateMany({
      where: {
        id: {
          in: messageIds,
        },
      },
      data: {
        status: 'READ',
      },
    });

    await this.prisma.messageReceipt.createMany({
      data: messageIds.map((id) => ({
        messageId: id,
        userId: userId,
      })),
      skipDuplicates: true,
    });

    return messageIds || [];
  }

  async handleConnection(socket: TypedSocket, user: User, server: TypedServer) {
    const existing = this.onlineUsers.get(user.id);
    if (existing?.timerId) clearTimeout(existing.timerId);

    this.onlineUsers.set(user.id, { isOnline: true, timerId: null, socket });
    server.emit('users:presence_update', Array.from(this.onlineUsers.keys()));

    const conversations = await this.prisma.conversation.findMany({
      where: { users: { some: { id: user.id } } },
    });

    for (const c of conversations) {
      void socket.join(c.id);
    }
  }

  handleDisconnect(socket: TypedSocket, user: User, server: TypedServer) {
    const updatePresence = async () => {
      this.onlineUsers.delete(user.id);
      server.emit('users:presence_update', Array.from(this.onlineUsers.keys()));
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastSeen: new Date().toISOString() },
      });
    };

    const timeout = setTimeout(() => void updatePresence(), 5000);

    this.onlineUsers.set(user.id, {
      isOnline: false,
      timerId: timeout,
      socket,
    });
  }

  async handleMessageCreate(
    socket: TypedSocket,
    user: PublicUserSchema,
    message: PublicMessageSchema,
    conversationId: string,
    tempId: string,
    parentMessageId?: string | null,
  ) {
    const content = message.body?.trim();
    if (!content) return;

    const createdMessage = await this.prisma.message.create({
      include: {
        author: true,
        parentMessage: { include: { author: true } },
      },
      data: {
        body: content,
        conversationId,
        authorId: user.id,
        status: 'DELIVERED',
        deliveredAt: new Date().toISOString(),
        parentMessageId: parentMessageId ?? null,
      },
    });

    const newMessage = { ...createdMessage, clientId: tempId };

    const messageIds = await this.markMessagesAsRead(conversationId, user.id);
    if (messageIds.length >= 0)
      socket
        .to(conversationId)
        .emit('message:read', conversationId, messageIds);

    socket.broadcast
      .to(conversationId)
      .emit('message:create', conversationId, newMessage, tempId);
    socket.emit('message:create:confirm', conversationId, newMessage, tempId);
    socket.to(conversationId).emit('typing:stop');
  }

  async handleMessageRead(
    socket: TypedSocket,
    user: User,
    conversationId: string,
  ) {
    const messageIds = await this.markMessagesAsRead(conversationId, user.id);
    if (messageIds.length >= 0)
      socket
        .to(conversationId)
        .emit('message:read', conversationId, messageIds);
  }

  async handleMessageReaction(
    conversationId: string,
    messageId: string,
    emoji: string,
    user: User,
    server: TypedServer,
  ) {
    const message = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        messageReactions: {
          upsert: {
            where: { messageId_userId: { messageId, userId: user.id } },
            create: { emoji, userId: user.id },
            update: { emoji },
          },
        },
      },
      include: {
        author: true,
        messageReactions: true,
        messageReceipts: true,
        parentMessage: { include: { author: true } },
      },
    });
    server
      ?.to(conversationId)
      .emit('message:reaction', conversationId, message);
  }

  async handleConversationCreate(
    socket: TypedSocket,
    user: User,
    otherId: string,
  ) {
    if (user.id === otherId) return;

    const otherUser = await this.prisma.user.findUnique({
      where: { id: otherId },
    });
    if (!otherUser) return;

    let conversation = await this.prisma.conversation.findFirst({
      where: {
        users: { every: { id: { in: [user.id, otherId] } } },
      },
      select: conversationSelect,
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { users: { connect: [{ id: user.id }, { id: otherId }] } },
        select: conversationSelect,
      });
    }

    const mappedMessages = conversation.messages
      .map((msg) => ({
        ...msg,
        isMine: msg.authorId === user.id,
        isBookmarked: msg.bookmarkedBy.some(({ id }) => id === user.id),
      }))
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

    const mapped = {
      ...conversation,
      messages: mappedMessages,
      title: otherUser.name ?? 'Conversation',
      lastSeen: otherUser.lastSeen ?? undefined,
    };

    await socket.join(conversation.id);
    const otherEntry = this.onlineUsers.get(otherId);
    if (otherEntry) await otherEntry.socket.join(conversation.id);

    socket.emit('conversation:create', mapped);
  }
}

const conversationSelect = {
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
      author: { select: { id: true, bio: true, name: true, imgUrl: true } },
      bookmarkedBy: true,
      messageReceipts: true,
      messageReactions: true,
      parentMessageId: true,
      parentMessage: {
        include: {
          author: { select: { id: true, name: true, imgUrl: true, bio: true } },
        },
      },
    },
  },
  users: {
    select: { id: true, name: true, imgUrl: true, bio: true, lastSeen: true },
  },
};
