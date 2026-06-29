import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ProfilingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Profiling');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          if (duration > 200) {
            this.logger.warn(`SLOW REQUEST ${method} ${url} — ${duration}ms`);
          } else {
            this.logger.log(`${method} ${url} — ${duration}ms`);
          }
        },
        error: (err) => {
          const duration = Date.now() - start;
          this.logger.error(`${method} ${url} — ${duration}ms — ${err.message}`);
        },
      }),
    );
  }
}
