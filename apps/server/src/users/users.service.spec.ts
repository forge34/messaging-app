import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService profile boundaries', () => {
  const prisma = {
    user: {
      findFirst: jest.fn(),
    },
  } as unknown as PrismaService;

  const service = new UsersService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns only public fields for another user profile', async () => {
    const publicUser = {
      id: 'u1',
      name: 'Alice',
      imgUrl: 'https://example.com/a.png',
      bio: '',
      lastSeen: null,
    };

    jest.mocked(prisma.user.findFirst).mockResolvedValue(publicUser as never);

    await expect(service.publicUser('u1')).resolves.toEqual(publicUser);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'u1' },
      select: {
        id: true,
        name: true,
        imgUrl: true,
        bio: true,
        lastSeen: true,
      },
    });
  });

  it('throws when a public profile does not exist', async () => {
    jest.mocked(prisma.user.findFirst).mockResolvedValue(null);

    await expect(service.publicUser('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('marks a bookmark as mine based on the current user id', async () => {
    jest.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'u1',
      name: 'Alice',
      imgUrl: '',
      bio: '',
      bookmarks: [
        {
          id: 'm1',
          body: 'hello',
          createdAt: new Date(),
          status: 'DELIVERED',
          conversationId: 'c1',
          authorId: 'u1',
          author: {
            id: 'u1',
            name: 'Alice',
            imgUrl: '',
            bio: '',
          },
        },
      ],
    } as never);

    const bookmarks = await service.getBookmarks('u1');

    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0]?.isMine).toBe(true);
    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u1' },
      }),
    );
  });
});
