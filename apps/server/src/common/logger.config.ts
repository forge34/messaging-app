import { Params } from 'nestjs-pino';
import type { IncomingMessage, ServerResponse } from 'node:http';

export function createLoggerConfig(): Params {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL ?? (isDevelopment ? 'debug' : 'info'),
      transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
      redact: {
        paths: [
          'req.headers.cookie',
          'req.headers.authorization',
          'res.headers["set-cookie"]',
        ],
        censor: '[REDACTED]',
      },
      serializers: {
        req(req: IncomingMessage) {
          return {
            id: (req as IncomingMessage & { id?: string }).id,
            method: req.method,
            url: req.url,
            remoteAddress: req.socket?.remoteAddress,
          };
        },
        res(res: ServerResponse) {
          return { statusCode: res.statusCode };
        },
      },
    },
  };
}
