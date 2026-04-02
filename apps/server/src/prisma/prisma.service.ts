import { createAdapter, PrismaClient } from '@chat/db/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = createAdapter(process.env.DATABASE_URL);

    super({ adapter });
  }
}
