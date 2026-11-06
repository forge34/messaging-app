import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { ConversationsService } from './conversations.service';

describe('ConversationsService access control', () => {
  const prisma = {
    conversation: {
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
  } as unknown as PrismaService;

  const service = new ConversationsService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('scopes conversation reads to the requesting user', async () => {
    const conversation = {
      id: 'c1',
      createdAt: new Date(),
      updatedAt: new Date(),
      users: [
        { id: 'u1', name: 'Alice', imgUrl: '', bio: '', lastSeen: null },
        { id: 'u2', name: 'Bob', imgUrl: '', bio: '', lastSeen: null },
      ],
      messages: [],
    };

    jest
      .mocked(prisma.conversation.findFirst)
      .mockResolvedValue(conversation as never);

    await service.getConversationById('c1', 'u1');

    expect(prisma.conversation.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'c1',
          users: { some: { id: 'u1' } },
        },
      }),
    );
  });

  it('returns not found when the user is not a conversation member', async () => {
    jest.mocked(prisma.conversation.findFirst).mockResolvedValue(null);

    await expect(service.getConversationById('c1', 'u3')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('scopes deletes to the requesting user', async () => {
    jest
      .mocked(prisma.conversation.deleteMany)
      .mockResolvedValue({ count: 1 });

    await service.delete('c1', 'u1');

    expect(prisma.conversation.deleteMany).toHaveBeenCalledWith({
      where: {
        id: 'c1',
        users: { some: { id: 'u1' } },
      },
    });
  });

  it('returns not found when deleting a conversation the user cannot access', async () => {
    jest
      .mocked(prisma.conversation.deleteMany)
      .mockResolvedValue({ count: 0 });

    await expect(service.delete('c1', 'u3')).rejects.toThrow(NotFoundException);
  });
});
