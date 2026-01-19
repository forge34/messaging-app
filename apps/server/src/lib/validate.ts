import { type ApiRoute } from "@chat/shared";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

interface TypedRequest<T> extends Request {
  body: T;
}

interface TypedResponse<T, TData> extends Response {
  json: ({ message, data }: { message: string; data?: TData | null }) => this;
}

export function createHandler<T extends ApiRoute>(
  route: T,
  handler: (
    req: TypedRequest<z.infer<T["request"]>>,
    res: TypedResponse<z.infer<T["response"]>, z.infer<T["response"]>["data"]>,
  ) => Promise<void>,
) {
  return async function (
    req: TypedRequest<z.infer<typeof route.request>>,
    res: Response,
    next: NextFunction,
  ) {
    const data = route.request.parse(req.body);
    req.body = data as typeof data;

    await handler(req, res);
  };
}
