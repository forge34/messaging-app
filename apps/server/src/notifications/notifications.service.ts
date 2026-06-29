import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@chat/db/client';
import { PublicNotificationSchema } from '@chat/shared';
import type z from 'zod';

type PublicNotification = z.infer<typeof PublicNotificationSchema>;

function actorSelect() {
  return {
    id: true,
    name: true,
    imgUrl: true,
    bio: true,
    lastSeen: true,
  } as const;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    type: 'MESSAGE' | 'REACTION',
    title: string,
    body: string | null,
    data: { conversationId: string; messageId: string } | null,
    actorId: string | null,
  ): Promise<{ notification: PublicNotification; count: number }> {
    const raw = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body: body ?? undefined,
        data: data ?? Prisma.DbNull,
        actorId: actorId ?? undefined,
      },
      include: {
        actor: { select: actorSelect() },
      },
    });

    const count = await this.getUnreadCount(userId);

    return {
      notification: PublicNotificationSchema.parse({
        ...raw,
        data: raw.data ?? null,
      }),
      count,
    };
  }

  async findByUser(
    userId: string,
    cursor?: string,
    take = 20,
  ): Promise<{
    notifications: PublicNotification[];
    nextCursor: string | undefined;
  }> {
    const raws = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        actor: { select: actorSelect() },
      },
    });

    const hasMore = raws.length > take;
    if (hasMore) raws.pop();

    return {
      notifications: raws.map((r) =>
        PublicNotificationSchema.parse({ ...r, data: r.data ?? null }),
      ),
      nextCursor: hasMore ? raws[raws.length - 1]?.id : undefined,
    };
  }

  async markRead(id: string) {
    await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }
}
