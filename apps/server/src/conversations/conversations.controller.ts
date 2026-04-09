import { Controller, Param, Req, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Route } from '../common/route.decorator';
import { Routes } from '@chat/shared';
import { type Request } from 'express';
import { type RequestParams } from '../common/helpers';
import { User } from '@chat/db/client';

@Controller('')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @UseGuards(JwtAuthGuard)
  @Route(Routes.deleteConversation)
  async deleteConversation(
    @Param() params: RequestParams<typeof Routes.getConversationById>,
  ) {
    await this.conversationsService.delete(params.id);
  }
  @UseGuards(JwtAuthGuard)
  @Route(Routes.getCurrentUserConversations)
  async getCurrentUserconversations(@Req() req: Request) {
    const { id: userId } = req.user as User;

    const conversations =
      await this.conversationsService.getCurrentUserConversation(userId);

    return { data: conversations };
  }

  @UseGuards(JwtAuthGuard)
  @Route(Routes.getConversationById)
  async getConversationById(
    @Req() req: Request,
    @Param() params: RequestParams<typeof Routes.getConversationById>,
  ) {
    const { id: userId } = req.user as User;
    const conversationid = params.id;

    const conversation = await this.conversationsService.getConversationById(
      conversationid,
      userId,
    );

    return { data: conversation };
  }
}
