import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcryptjs';
import { AvatarGenerator } from 'random-avatar-generator';

const generator = new AvatarGenerator();

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signUp(username: string, password: string) {
    const exists = await this.prisma.user.findUnique({
      where: {
        name: username,
      },
    });

    if (exists) {
      return false;
    }

    const hash = await bcrypt.hash(password, 10);

    await this.prisma.user.create({
      data: {
        name: username,
        password: hash,
        imgUrl: generator.generateRandomAvatar(),
      },
    });

    return true;
  }

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        name: username,
      },
      select: {
        password: true,
        id: true,
        name: true,
        bio: true,
        imgUrl: true,
        lastSeen: true,
      },
    });

    if (!user) return null;

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return null;
    }
    const { id, name, bio, imgUrl, lastSeen } = user;
    return { id, name, bio, imgUrl, lastSeen };
  }
}
