import { Route } from "@chat/shared";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

type TypedRequest<T> = Omit<Request, "body"> & {
  body: T;
};

interface TypedResponse<T> extends Response {
  json: (body: T) => this;
}

export function createHandler<T extends Route>(
  route: T,
  handler: (
    req: TypedRequest<z.infer<T["requestBody"]>>,
    res: TypedResponse<z.infer<T["responseSchema"]>>,
  ) => Promise<void>,
) {
  return async function (
    req: TypedRequest<z.infer<T["requestBody"]>>,
    res: TypedResponse<z.infer<T["responseSchema"]>>,
    _: NextFunction,
  ) {
    const data = route.requestBody.parse(req.body);
    req.body = data as typeof req.body;

    await handler(req, res);
  };
}
