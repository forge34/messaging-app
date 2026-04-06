import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(process.cwd(), '../../.env'),
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService, PrismaService, JwtStrategy],
})
export class AppModule {}
