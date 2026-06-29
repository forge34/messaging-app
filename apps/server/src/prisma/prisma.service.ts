import { createAdapterWithPool, PrismaClient } from '@chat/db/client';
import { Injectable, Logger } from '@nestjs/common';

const POOL_SIZE = parseInt(process.env.DATABASE_POOL_SIZE || '50', 10);

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger('Prisma');

  constructor() {
    const adapter = createAdapterWithPool({
      databaseUrl: process.env.DATABASE_URL,
      maxPoolSize: POOL_SIZE,
    });

    super({
      adapter,
      log:
        process.env.PROFILE === '1'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ]
          : undefined,
    });

    this.logger.log(`Database pool size: ${POOL_SIZE}`);

    if (process.env.PROFILE === '1') {
      this.$on('query' as never, (e: any) => {
        if (e.duration > 100) {
          this.logger.warn(
            `SLOW QUERY ${e.duration}ms — ${e.query.slice(0, 200)}`,
          );
        }
      });
    }
  }
}
