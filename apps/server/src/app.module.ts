import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersController } from './users/users.controller.js';
import { UsersService } from './users/users.service.js';
import { PrismaService } from './prisma/prisma.service.js';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthModule } from './auth/auth.module.js';
import { JwtStrategy } from './auth/jwt.strategy.js';
import { ConversationsModule } from './conversations/conversations.module.js';
import { ChatModule } from './chat/chat.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { AllExceptionsFilter } from './common/all-exceptions.filter.js';
import { createLoggerConfig } from './common/logger.config.js';
import { validateEnv } from './config/env.validation.js';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(process.cwd(), '../../.env'),
      isGlobal: true,
      validate: validateEnv,
    }),
    AuthModule,
    ConversationsModule,
    ChatModule,
    NotificationsModule,
    UploadsModule,
    LoggerModule.forRootAsync({ useFactory: createLoggerConfig }),
  ],
  controllers: [AppController, UsersController],
  providers: [
    AppService,
    UsersService,
    PrismaService,
    JwtStrategy,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
