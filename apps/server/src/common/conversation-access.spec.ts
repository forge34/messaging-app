import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import { assertConversationMember } from './conversation-access.js';
import { describe, vi, beforeEach, it, expect } from 'vitest';

describe('assertConversationMember', () => {
  const findFirst = vi.fn();

  const prisma = {
    conversation: {
      findFirst,
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts a member of the conversation', async () => {
    findFirst.mockResolvedValue({ id: 'c1' });

    await expect(
      assertConversationMember(prisma, 'u1', 'c1'),
    ).resolves.toBeUndefined();

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: 'c1',
        users: { some: { id: 'u1' } },
      },
      select: { id: true },
    });
  });

  it('rejects a non-member', async () => {
    findFirst.mockResolvedValue(null);

    await expect(assertConversationMember(prisma, 'u2', 'c1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
