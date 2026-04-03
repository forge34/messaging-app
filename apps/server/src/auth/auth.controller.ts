import { Body, Controller, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Route } from '../common/route.decorator';
import { type RequestBody, Routes } from '@chat/shared';
import { type CookieOptions, type Response } from 'express';
import { JwtService } from '@nestjs/jwt';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: '/',
};

@Controller('')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Route(Routes.signup)
  async signUp(
    @Res({ passthrough: true }) res: Response,
    @Body() body: RequestBody<typeof Routes.signup>,
  ) {
    const success = await this.authService.signUp(body.username, body.password);

    if (!success) {
      res.status(409);
      return { message: 'Username already exists' };
    }

    res.status(200);
    return { message: 'User account created successfully' };
  }
  @Route(Routes.login)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() body: RequestBody<typeof Routes.login>,
  ) {
    const user = await this.authService.login(body.username, body.password);
    if (!user) throw new UnauthorizedException();

    const token = await this.jwtService.signAsync({ id: user.id });
    res.cookie('jwt', token, cookieOptions);
    return { message: 'Login sucess' };
  }
}
