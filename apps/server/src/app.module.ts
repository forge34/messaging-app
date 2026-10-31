import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from './auth/jwt.strategy';
import { ConversationsModule } from './conversations/conversations.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { createLoggerConfig } from './common/logger.config';
import { validateEnv } from './config/env.validation';
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
