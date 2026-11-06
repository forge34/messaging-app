import { NotFoundException } from '@nestjs/common';
import type { User } from '@chat/db/client';
import type { PublicMessageSchema, PublicUserSchema } from '@chat/shared';
import type { PrismaService } from '../prisma/prisma.service';
import type { NotificationsService } from '../notifications/notifications.service';
import { ChatService } from './chat.service';

describe('ChatService conversation access control', () => {
  const prisma = {
    conversation: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
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
    jest.mocked(prisma.conversation.findFirst).mockResolvedValue(null);

    await expect(
      service.handleMessageCreate(
        socket,
        user as PublicUserSchema,
        { body: 'hello' } as PublicMessageSchema,
        'c1',
        'temp-1',
      ),
    ).rejects.toThrow(NotFoundException);

    expect(prisma.message.create).not.toHaveBeenCalled();
  });

  it('does not mark messages read when the user is not a member', async () => {
    jest.mocked(prisma.conversation.findFirst).mockResolvedValue(null);

    await expect(
      service.handleMessageRead(socket, user, 'c1'),
    ).rejects.toThrow(NotFoundException);

    expect(prisma.message.findMany).not.toHaveBeenCalled();
  });

  it('does not react to a message outside the conversation', async () => {
    jest
      .mocked(prisma.conversation.findFirst)
      .mockResolvedValue({ id: 'c1' } as never);
    jest.mocked(prisma.message.findFirst).mockResolvedValue(null);

    await expect(
      service.handleMessageReaction('c1', 'm1', '👍', user, server),
    ).rejects.toThrow(NotFoundException);

    expect(prisma.message.update).not.toHaveBeenCalled();
  });
});
