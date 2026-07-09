import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');
  use(req: any, res: any, next: () => void) {
    this.logger.log(`--> ${req.method} ${req.url}`);
    res.on('finish', () => {
      this.logger.log(`<-- ${req.method} ${req.url} ${res.statusCode}`);
    });
    next();
  }
}
