import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';
import { parse } from 'cookie';
import passport from 'passport';
import { NextFunction, Response } from 'express';
import { IncomingMessage } from 'http';
import { corsOptions } from '../main.js';

interface EngineRequest extends IncomingMessage {
  _query: Record<string, string>;
  cookies?: Record<string, string | undefined>;
}

type ConnectMiddleware = (
  req: IncomingMessage,
  res: Response,
  next: NextFunction,
) => void;

// passport's typings expose authenticate() as `any`; pin the middleware shape.
const jwtMiddleware = passport.authenticate('jwt', {
  session: false,
  failWithError: true,
}) as unknown as ConnectMiddleware;

export class SocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): Server {
    const serverOptions: ServerOptions = {
      ...options,
      cors: corsOptions,
    } as ServerOptions;
    const server: Server = super.createIOServer(port, serverOptions);

    server.engine.use(
      (req: EngineRequest, res: Response, next: NextFunction) => {
        if (!req.headers.cookie) return next(new Error('Unauthorized'));

        req.cookies = {};
        req.cookies.jwt = parse(req.headers.cookie).jwt;

        const isHandshake = req._query.sid === undefined;
        if (isHandshake) {
          jwtMiddleware(req, res, next);
        } else {
          next();
        }
      },
    );

    return server;
  }
}
