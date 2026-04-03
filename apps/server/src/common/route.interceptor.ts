import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Route } from '@chat/shared';
import { Observable } from 'rxjs';
import z, { ZodType } from 'zod';
import { type Response as ExpressResponse } from 'express';

export type Response = z.infer<Route['responseSchema']>;
export interface RouteResponse {
  message: string;
  data: ZodType;
}

export class RouteResponseInterceptor implements NestInterceptor<
  RouteResponse,
  Response
> {
  constructor(private route: Route) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<RouteResponse>,
  ): Observable<Response> {
    return next.handle().pipe(
      map((data) => {
        const res = context.switchToHttp().getResponse<ExpressResponse>();
        const response = {
          code: res.statusCode,
          message: data?.message ?? 'OK',
          data: data?.data,
        };
        return this.route.responseSchema.parse(response);
      }),
    );
  }
}
