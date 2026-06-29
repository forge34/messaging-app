import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async users(currentUserId: string, cursor?: string, take = 20) {
    return this.prisma.$transaction(async (tx) => {
      const raws = await tx.user.findMany({
        where: { id: { not: currentUserId } },
        omit: { password: true },
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { id: 'asc' },
      });

      const hasMore = raws.length > take;
      if (hasMore) raws.pop();

      const userIds = raws.map((u) => u.id);

      const conversations = await tx.conversation.findMany({
        where: {
          AND: [
            { users: { some: { id: currentUserId } } },
            { users: { some: { id: { in: userIds } } } },
          ],
        },
        include: { users: { select: { id: true } } },
      });

      const users = raws.map((u) => {
        const conv = conversations.find((c) =>
          c.users.some((cu) => cu.id === u.id),
        );
        return {
          ...u,
          isCurrent: false,
          hasConversation: !!conv?.id,
          mutualConversation: conv?.id,
        };
      });

      return {
        users,
        nextCursor: hasMore ? raws[raws.length - 1]?.id : undefined,
      };
    });
  }

  async user(id: string) {
    return this.prisma.user.findFirst({
      where: {
        id: id,
      },
      omit: {
        password: true,
      },
      include: {
        blocked: true,
        blockedBy: true,
        messages: {
          omit: {
            deliveredAt: true,
          },
        },
        bookmarks: true,
        conversations: true,
      },
    });
  }

  async getBookmarks(id: string) {
    const user = await this.prisma.user.findFirst({
      select: {
        id: true,
        imgUrl: true,
        name: true,
        bio: true,
        bookmarks: {
          include: {
            author: {
              select: {
                id: true,
                imgUrl: true,
                name: true,
                bio: true,
              },
            },
          },
        },
      },

      where: {
        id: id,
      },
    });

    if (!user) return [];

    const bookmarks = user.bookmarks.map(
      ({ author, id, body, createdAt, status, conversationId, authorId }) => {
        const isMine = author.id === id;
        return {
          id,
          body,
          author,
          createdAt,
          isMine,
          isBookmarked: true,
          status,
          conversationId,
          authorId,
        };
      },
    );
    return bookmarks;
  }

  async block(id: string, blockedId: string) {
    await this.prisma.user.update({
      where: { id: id },
      data: {
        blocked: {
          connect: [{ id: blockedId }],
        },
      },
    });
  }
}
