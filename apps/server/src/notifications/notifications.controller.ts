import { Controller, Param, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Route } from '../common/route.decorator';
import { Routes } from '@chat/shared';
import { type Request } from 'express';
import { type RequestParams, type RequestQueries } from '../common/helpers';
import { User } from '@chat/db/client';

@Controller('')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Route(Routes.getNotifications)
  async getNotifications(
    @Req() req: Request,
    @Query() queries: RequestQueries<typeof Routes.getNotifications>,
  ) {
    const { id: userId } = req.user as User;
    const result = await this.notificationsService.findByUser(
      userId,
      queries.cursor,
      queries.take,
    );
    return { data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Route(Routes.markNotificationRead)
  async markNotificationRead(
    @Param() params: RequestParams<typeof Routes.markNotificationRead>,
  ) {
    await this.notificationsService.markRead(params.id);
  }

  @UseGuards(JwtAuthGuard)
  @Route(Routes.markAllNotificationsRead)
  async markAllNotificationsRead(@Req() req: Request) {
    const { id: userId } = req.user as User;
    await this.notificationsService.markAllRead(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Route(Routes.getUnreadNotificationCount)
  async getUnreadNotificationCount(@Req() req: Request) {
    const { id: userId } = req.user as User;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { data: { count } };
  }
}
