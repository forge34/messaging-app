import { type Route } from '@chat/shared';
import {
  applyDecorators,
  Delete,
  Get,
  Post,
  Put,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from './zod.pipe';
import { RouteResponseInterceptor } from './route.interceptor';

const methodDecorator = {
  POST: Post,
  GET: Get,
  PUT: Put,
  DELETE: Delete,
};

export function Route(route: Route) {
  const method = methodDecorator[route.method];

  return applyDecorators(
    method(route.path),
    UsePipes(new ZodValidationPipe(route)),
    UseInterceptors(new RouteResponseInterceptor(route)),
  );
}
