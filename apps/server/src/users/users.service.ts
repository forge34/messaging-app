import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async users(currentUserId: string) {
    const users = await this.prisma.user.findMany({
      omit: {
        password: true,
      },
    });

    const conversations = await this.prisma.conversation.findMany({
      include: {
        users: true,
      },
    });

    const mappedUsers = users.map((u) => {
      const conversation = conversations.find((c) => {
        return (
          c.users.some((u1) => u1.id === u.id) &&
          c.users.some((u2) => u2.id === currentUserId)
        );
      });

      return {
        ...u,
        isCurrent: u.id === currentUserId,
        hasConversation: !!conversation?.id,
        mutualConversation: conversation?.id,
      };
    });

    return mappedUsers;
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
