import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { assertConversationMember } from './conversation-access';

describe('assertConversationMember', () => {
  const prisma = {
    conversation: {
      findFirst: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('accepts a member of the conversation', async () => {
    jest
      .mocked(prisma.conversation.findFirst)
      .mockResolvedValue({ id: 'c1' } as never);

    await expect(
      assertConversationMember(prisma, 'u1', 'c1'),
    ).resolves.toBeUndefined();

    expect(prisma.conversation.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'c1',
        users: { some: { id: 'u1' } },
      },
      select: { id: true },
    });
  });

  it('rejects a non-member', async () => {
    jest.mocked(prisma.conversation.findFirst).mockResolvedValue(null);

    await expect(
      assertConversationMember(prisma, 'u2', 'c1'),
    ).rejects.toThrow(NotFoundException);
  });
});
