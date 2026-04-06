import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@chat/db/client';

const cookieExtractor = (req: Request) => {
  let jwt = null;
  if (req && req.cookies) {
    jwt = req.cookies['jwt'] as string | null;
  }

  return jwt;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET || '',
    });
  }

  async validate(payload: User) {
    return { ...payload };
  }
}
