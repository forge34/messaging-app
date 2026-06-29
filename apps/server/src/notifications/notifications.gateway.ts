import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  ClientEvents,
  ClientToServerEvents,
  ServerToClientEvents,
} from '@chat/shared';
import { type Request } from 'express';
import { NotificationsService } from './notifications.service';
import { User } from '@chat/db/client';
import { ChatZodValidationPipe } from '../chat/zod.pipe';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

@WebSocketGateway()
export class NotificationsGateway {
  @WebSocketServer()
  server!: TypedServer;

  constructor(private readonly notificationsService: NotificationsService) {}

  @SubscribeMessage('notification:read')
  async onNotificationRead(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody(new ChatZodValidationPipe(ClientEvents, 'notification:read'))
    args: [notificationId: string],
  ) {
    const req = socket.request as Request;
    const user = req.user as User;
    if (!user) return;

    const [notificationId] = args;
    await this.notificationsService.markRead(notificationId);

    const count = await this.notificationsService.getUnreadCount(user.id);
    this.server.to(`user:${user.id}`).emit('notification:unread_count', count);
  }
}
