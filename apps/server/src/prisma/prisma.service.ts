import { createAdapterWithPool, PrismaClient } from '@chat/db/client';
import type { Prisma } from '@chat/db/client';
import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';

const POOL_SIZE = parseInt(process.env.DATABASE_POOL_SIZE || '50', 10);
const SLOW_QUERY_THRESHOLD_MS = parseInt(
  process.env.SLOW_QUERY_THRESHOLD_MS || '100',
  10,
);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger('Prisma');

  constructor() {
    const isProfiling = process.env.PROFILE === '1';
    const isDev = process.env.NODE_ENV === 'development';

    const adapter = createAdapterWithPool({
      databaseUrl: process.env.DATABASE_URL,
      maxPoolSize: POOL_SIZE,
    });

    super({
      adapter,
      log:
        isProfiling || isDev
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'event', level: 'warn' },
              { emit: 'event', level: 'error' },
            ]
          : undefined,
    });

    this.logger.log(`Database pool size: ${POOL_SIZE}`);
    this.logger.log(`Slow query threshold: ${SLOW_QUERY_THRESHOLD_MS}ms`);

    if (isProfiling || isDev) {
      this.$on('query' as never, (e: Prisma.QueryEvent) => {
        const msg = `(${e.duration}ms) ${e.query}`;

        if (e.duration > SLOW_QUERY_THRESHOLD_MS) {
          this.logger.warn(`SLOW QUERY — ${msg}`);
        } else {
          this.logger.debug(msg);
        }
      });

      this.$on('warn' as never, (e: Prisma.LogEvent) => {
        this.logger.warn(e.message);
      });

      this.$on('error' as never, (e: Prisma.LogEvent) => {
        this.logger.error(e.message);
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
