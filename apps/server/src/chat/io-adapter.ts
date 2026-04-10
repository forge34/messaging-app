import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';
import { parse } from 'cookie';
import passport from 'passport';
import { NextFunction, Response } from 'express';
import { IncomingMessage } from 'http';
import { corsOptions } from '../main';

interface EngineRequest extends IncomingMessage {
  _query: Record<string, string>;
  cookies?: Record<string, string | undefined>;
}

export class SocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): Server {
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: corsOptions,
    });

    server.engine.use(
      (req: EngineRequest, res: Response, next: NextFunction) => {
        if (!req.headers.cookie) return next(new Error('Unauthorized'));

        req.cookies = {};
        req.cookies.jwt = parse(req.headers.cookie).jwt;

        const isHandshake = req._query.sid === undefined;
        if (isHandshake) {
          passport.authenticate('jwt', { session: false, failWithError: true })(
            req,
            res,
            next,
          );
        } else {
          next();
        }
      },
    );

    return server;
  }
}
