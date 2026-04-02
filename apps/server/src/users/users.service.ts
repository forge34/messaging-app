import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly Prisma: PrismaService) {}

  async users() {
    return this.Prisma.user.findMany({
      omit: {
        password: true,
      },
    });
  }

  async user(id: string) {
    return this.Prisma.user.findFirst({
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
}
