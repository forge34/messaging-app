import { NotFoundException } from '@nestjs/common';
import type { User } from '@chat/db/client';
import type { PublicMessageSchema, PublicUserSchema } from '@chat/shared';
import type { PrismaService } from '../prisma/prisma.service';
import type { NotificationsService } from '../notifications/notifications.service';
import { ChatService } from './chat.service';

describe('ChatService conversation access control', () => {
  const conversationFindFirst = jest.fn();
  const messageCreate = jest.fn();
  const messageFindFirst = jest.fn();
  const messageFindMany = jest.fn();
  const messageUpdate = jest.fn();

  const prisma = {
    conversation: {
      findFirst: conversationFindFirst,
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    message: {
      create: messageCreate,
      findFirst: messageFindFirst,
      findMany: messageFindMany,
      update: messageUpdate,
      updateMany: jest.fn(),
    },
    messageReceipt: {
      createMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  } as unknown as PrismaService;

  const notifications = {
    create: jest.fn(),
  } as unknown as NotificationsService;

  const service = new ChatService(prisma, notifications);

  const socket = {
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    broadcast: { to: jest.fn().mockReturnThis() },
    join: jest.fn(),
  } as never;

  const server = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  } as never;

  const user = { id: 'u1', name: 'Alice' } as User;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not create a message when the sender is not a member', async () => {
    conversationFindFirst.mockResolvedValue(null);

    await expect(
      service.handleMessageCreate(
        socket,
        user as PublicUserSchema,
        { body: 'hello' } as PublicMessageSchema,
        'c1',
        'temp-1',
      ),
    ).rejects.toThrow(NotFoundException);

    expect(messageCreate).not.toHaveBeenCalled();
  });

  it('does not mark messages read when the user is not a member', async () => {
    conversationFindFirst.mockResolvedValue(null);

    await expect(service.handleMessageRead(socket, user, 'c1')).rejects.toThrow(
      NotFoundException,
    );

    expect(messageFindMany).not.toHaveBeenCalled();
  });

  it('does not react to a message outside the conversation', async () => {
    conversationFindFirst.mockResolvedValue({ id: 'c1' } as never);
    messageFindFirst.mockResolvedValue(null);

    await expect(
      service.handleMessageReaction('c1', 'm1', '👍', user, server),
    ).rejects.toThrow(NotFoundException);

    expect(messageUpdate).not.toHaveBeenCalled();
  });
});
