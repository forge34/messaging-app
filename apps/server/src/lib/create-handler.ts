import { Route } from "@chat/shared";
import { Request, RequestHandler, Response } from "express";
import { z } from "zod";

type TypedRequest<TParams, T, TReqBody, TQueries> = Request<
  TParams,
  T,
  TReqBody,
  TQueries
>;

type InferReq<T extends Route> = TypedRequest<
  z.infer<T["params"]>,
  unknown,
  z.infer<T["requestBody"]>,
  z.infer<T["queries"]>
>;

export function createHandler<T extends Route>(
  route: T,
  handler: (
    req: InferReq<T>,
    res: Response,
  ) => Promise<z.infer<T["responseSchema"]> | undefined>,
): RequestHandler {
  return async function (req: Request, res: Response) {
    const body = route.requestBody.parse(req.body);
    const params = route.params.parse(req.params);
    const query = route.queries.parse(req.query);

    const handlerResult = await handler(
      { ...req, body, params, query } as unknown as InferReq<T>,
      res,
    );

    if (!handlerResult) return;
    const result = route.responseSchema.parse(handlerResult);

    if (result) {
      const data = route.responseData.parse(result.data);

      res.status(result.code).json({ message: result.message, data: data });
    }
  };
}
