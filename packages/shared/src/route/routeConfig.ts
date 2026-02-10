import { z } from "zod";

const MethodSchema = z.literal(["POST", "GET", "DELETE", "PUT"]);
type Method = z.infer<typeof MethodSchema>;
type ExtractParams<P extends string> =
  P extends `${string}/:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : P extends `${string}/:${infer Param}`
      ? Param
      : never;


export type RouteConfig<
  Path extends string,
  B extends z.ZodType,
  R extends z.ZodType,
  P extends z.ZodType,
  Q extends z.ZodType,
> = {
  method: Method;
  path: Path;
  requestBody: B;
  params: P;
  queries: Q;
  responseData: R;
};

export const createRoute = <
  Path extends string,
  B extends z.ZodType,
  R extends z.ZodType,
  P extends z.ZodObject<{ [K in ExtractParams<Path>]: z.ZodType }>,
  Q extends z.ZodType,
>(
  config: RouteConfig<Path, B, R, P, Q>,
) => {
  const responseSchema = z.object({
    code: z.number(),
    message: z.string(),
    data: config.responseData.optional(),
  });

  return {
    ...config,
    responseSchema,
  };
};

export type Route = ReturnType<typeof createRoute>;
