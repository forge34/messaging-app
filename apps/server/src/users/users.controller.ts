import { Controller, Param, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { Route } from '../common/route.decorator.js';
import { Routes } from '@chat/shared';
import { type Request } from 'express';
import { User } from '@chat/db/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { type RequestParams, type RequestQueries } from '../common/helpers.js';

@Controller('')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Route(Routes.getUsers)
  async getAllUsers(
    @Req() req: Request,
    @Query() queries: RequestQueries<typeof Routes.getUsers>,
  ) {
    const user = req.user as User;
    if (!user) return;

    const data = await this.userService.users(
      user.id,
      queries.cursor,
      queries.take,
    );
    return { data };
  }

  @UseGuards(JwtAuthGuard)
  @Route(Routes.getCurrentUser)
  getCurrent(@Req() req: Request) {
    const user = req.user as User;

    return { data: user };
  }

  @UseGuards(JwtAuthGuard)
  @Route(Routes.getMyProfile)
  async getMyProfile(@Req() req: Request) {
    const user = req.user as User;
    const profile = await this.userService.myProfile(user.id);

    return { data: profile };
  }
  @UseGuards(JwtAuthGuard)
  @Route(Routes.getBookmarks)
  async getBookmarks(@Req() req: Request) {
    const user = req.user as User;
    const bookmarks = await this.userService.getBookmarks(user.id);
    return { data: bookmarks };
  }

  @UseGuards(JwtAuthGuard)
  @Route(Routes.getUserById)
  async getUserByid(@Param() params: RequestParams<typeof Routes.getUserById>) {
    const { id } = params;

    const user = await this.userService.publicUser(id);
    return { data: user };
  }

  @UseGuards(JwtAuthGuard)
  @Route(Routes.blockUser)
  async blockUser(
    @Req() req: Request,
    @Param() params: RequestParams<typeof Routes.getUserById>,
  ) {
    const user = req.user as User;
    const { id } = params;

    await this.userService.block(user.id, id);
  }
}
