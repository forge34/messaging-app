import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPrismaClient } from '@chat/db/client';

@Injectable()
export class PrismaService implements OnModuleInit {
  public client: ReturnType<typeof createPrismaClient>;

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('DATABASE_URL');
    this.client = createPrismaClient(url);
  }

  async onModuleInit() {
    await this.client.$connect();
  }
}
