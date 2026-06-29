import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { SocketIoAdapter } from './chat/io-adapter';
import { ProfilingInterceptor } from './common/profiling.interceptor';

export const corsOptions: CorsOptions = {
  origin: ['http://localhost:5173', process.env.CLIENT_URL || ''],
  credentials: true,
  allowedHeaders: ['Content-type'],
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: corsOptions });

  if (process.env.PROFILE === '1') {
    app.useGlobalInterceptors(new ProfilingInterceptor());
  }

  app.useWebSocketAdapter(new SocketIoAdapter(app));
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
