import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  ClientEvents,
  ClientToServerEvents,
  PublicMessageSchema,
  ServerToClientEvents,
} from '@chat/shared';
import { type Request } from 'express';
import { ChatService } from './chat.service';
import { User } from '@chat/db/client';
import { ChatZodValidationPipe } from './zod.pipe';
export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: TypedServer;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(socket: TypedSocket) {
    const req = socket.request as Request;
    const user = req.user as User;
    if (!user) {
      socket.disconnect();
      return;
    }

    await this.chatService.handleConnection(socket, user, this.server);
  }

  handleDisconnect(socket: TypedSocket) {
    const req = socket.request as Request;
    const user = req.user as User;
    if (!user) return;

    this.chatService.handleDisconnect(socket, user, this.server);
  }

  @SubscribeMessage('message:create')
  async onMessageCreate(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody(new ChatZodValidationPipe(ClientEvents, 'message:create'))
    args: [
      message: PublicMessageSchema,
      conversationId: string,
      tempId: string,
      parentMessageId?: string | null,
    ],
  ) {
    const req = socket.request as Request;
    const user = req.user as User;
    const [message, conversationId, tempId, parentMessageId] = args;
    await this.chatService.handleMessageCreate(
      socket,
      user,
      message,
      conversationId,
      tempId,
      parentMessageId,
    );
  }

  @SubscribeMessage('message:read')
  async onMessageRead(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody(new ChatZodValidationPipe(ClientEvents, 'message:read'))
    args: [conversationId: string],
  ) {
    const req = socket.request as Request;
    const user = req.user as User;
    const [conversationId] = args;
    await this.chatService.handleMessageRead(socket, user, conversationId);
  }

  @SubscribeMessage('message:reaction')
  async onMessageReaction(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody(new ChatZodValidationPipe(ClientEvents, 'message:reaction'))
    args: [conversationId: string, messageId: string, emoji: string],
  ) {
    const req = socket.request as Request;
    const user = req.user as User;
    const [conversationId, messageId, emoji] = args;
    await this.chatService.handleMessageReaction(
      conversationId,
      messageId,
      emoji,
      user,
      this.server,
    );
  }

  @SubscribeMessage('typing')
  onTyping(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody(new ChatZodValidationPipe(ClientEvents, 'typing'))
    args: [conversationId: string, username: string],
  ) {
    const [conversationId, username] = args;
    socket.to(conversationId).emit('typing', username);
  }

  @SubscribeMessage('typing:stop')
  onTypingStop(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody(new ChatZodValidationPipe(ClientEvents, 'typing:stop'))
    args: [conversationId: string],
  ) {
    const [conversationId] = args;
    socket.to(conversationId).emit('typing:stop');
  }

  @SubscribeMessage('conversation:create')
  async onConversationCreate(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody(new ChatZodValidationPipe(ClientEvents, 'conversation:create'))
    args: [otherId: string],
  ) {
    const req = socket.request as Request;
    const user = req.user as User;

    const [otherId] = args;
    await this.chatService.handleConversationCreate(socket, user, otherId);
  }
}
