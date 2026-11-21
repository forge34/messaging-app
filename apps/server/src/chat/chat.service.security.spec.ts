import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { User } from '@chat/db/client';
import type { PublicMessageSchema, PublicUserSchema } from '@chat/shared';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { NotificationsService } from '../notifications/notifications.service.js';
import { ChatService } from './chat.service.js';
import type { TypedServer, TypedSocket } from './chat.gateway.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ChatService conversation access control', () => {
  const conversationFindFirst = vi.fn();
  const messageCreate = vi.fn();
  const messageFindFirst = vi.fn();
  const messageFindMany = vi.fn();
  const messageUpdate = vi.fn();
  const messageDelete = vi.fn();

  const prisma = {
    conversation: {
      findFirst: conversationFindFirst,
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    message: {
      create: messageCreate,
      findFirst: messageFindFirst,
      findMany: messageFindMany,
      update: messageUpdate,
      updateMany: vi.fn(),
      delete: messageDelete,
    },
    messageReceipt: {
      createMany: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  } as unknown as PrismaService;

  const notifications = {
    create: vi.fn(),
  } as unknown as NotificationsService;

  const service = new ChatService(prisma, notifications);

  const socket = {
    emit: vi.fn(),
    to: vi.fn().mockReturnThis(),
    broadcast: { to: vi.fn().mockReturnThis() },
    join: vi.fn(),
  } as unknown as TypedSocket;

  const server = {
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
  } as unknown as TypedServer;

  const user = { id: 'u1', name: 'Alice' } as User;

  beforeEach(() => {
    vi.clearAllMocks();
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
    conversationFindFirst.mockResolvedValue({ id: 'c1' });
    messageFindFirst.mockResolvedValue(null);

    await expect(
      service.handleMessageReaction('c1', 'm1', '👍', user, server),
    ).rejects.toThrow(NotFoundException);

    expect(messageUpdate).not.toHaveBeenCalled();
  });

  it('does not delete a message when the user is not a member', async () => {
    conversationFindFirst.mockResolvedValue(null);

    await expect(
      service.handleMessageDelete('c1', 'm1', user, server),
    ).rejects.toThrow(NotFoundException);

    expect(messageDelete).not.toHaveBeenCalled();
  });

  it('does not delete a message authored by another user', async () => {
    conversationFindFirst.mockResolvedValue({ id: 'c1' });
    messageFindFirst.mockResolvedValue({ authorId: 'u2' });

    await expect(
      service.handleMessageDelete('c1', 'm1', user, server),
    ).rejects.toThrow(ForbiddenException);

    expect(messageDelete).not.toHaveBeenCalled();
  });

  it('deletes an own message and notifies the conversation', async () => {
    conversationFindFirst.mockResolvedValue({ id: 'c1' });
    messageFindFirst.mockResolvedValue({ authorId: 'u1' });
    messageDelete.mockResolvedValue({});

    await service.handleMessageDelete('c1', 'm1', user, server);

    expect(messageDelete).toHaveBeenCalledWith({ where: { id: 'm1' } });
    expect(server.to).toHaveBeenCalledWith('c1');
    expect(server.emit).toHaveBeenCalledWith('message:delete', 'c1', 'm1');
  });

  it('does not bookmark a message when the user is not a member', async () => {
    conversationFindFirst.mockResolvedValue(null);

    await expect(
      service.handleMessageBookmark('c1', 'm1', user, server),
    ).rejects.toThrow(NotFoundException);

    expect(messageUpdate).not.toHaveBeenCalled();
  });

  it('bookmarks a message for the user and notifies their sockets', async () => {
    conversationFindFirst.mockResolvedValue({ id: 'c1' });
    messageFindFirst.mockResolvedValue({
      id: 'm1',
      bookmarkedBy: [],
    });
    messageUpdate.mockResolvedValue({});

    await service.handleMessageBookmark('c1', 'm1', user, server);

    expect(messageUpdate).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { bookmarkedBy: { connect: { id: 'u1' } } },
    });
    expect(server.to).toHaveBeenCalledWith('user:u1');
    expect(server.emit).toHaveBeenCalledWith(
      'message:bookmark',
      'c1',
      'm1',
      true,
    );
  });

  it('removes an existing bookmark for the user', async () => {
    conversationFindFirst.mockResolvedValue({ id: 'c1' });
    messageFindFirst.mockResolvedValue({
      id: 'm1',
      bookmarkedBy: [{ id: 'u1' }],
    });
    messageUpdate.mockResolvedValue({});

    await service.handleMessageBookmark('c1', 'm1', user, server);

    expect(messageUpdate).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { bookmarkedBy: { disconnect: { id: 'u1' } } },
    });
    expect(server.emit).toHaveBeenCalledWith(
      'message:bookmark',
      'c1',
      'm1',
      false,
    );
  });
});
