import { Route } from "@chat/shared";
import { Request, RequestHandler, Response } from "express";
import { z } from "zod";

type TypedRequest<TParams, T, TReqBody, TQueries> = Request<
  TParams,
  T,
  TReqBody,
  TQueries
>;

type TypedResponse<T> = Response & {
  json: (body: T) => Response;
};

type InferReq<T extends Route> = TypedRequest<
  z.infer<T["params"]>,
  unknown,
  z.infer<T["requestBody"]>,
  z.infer<T["queries"]>
>;

type InferRes<T extends Route> = TypedResponse<z.infer<T["responseSchema"]>>;

export function createHandler<T extends Route>(
  route: T,
  handler: (req: InferReq<T>, res: InferRes<T>) => Promise<void>,
): RequestHandler {
  return async function (req: Request, res: Response) {
    const body = route.requestBody.parse(req.body);
    const params = route.params.parse(req.params);
    const query = route.queries.parse(req.query);

    await handler(
      { ...req, body, params, query } as unknown as InferReq<T>,
      res,
    );
  };
}
