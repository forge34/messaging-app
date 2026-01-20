import { z } from "zod";

const MethodSchema = z.literal(["POST", "GET", "DELETE", "PUT"]);
type Method = z.infer<typeof MethodSchema>;

export type RouteConfig<
  B extends z.ZodTypeAny,
  R extends z.ZodTypeAny,
  P extends z.ZodTypeAny,
  Q extends z.ZodTypeAny,
> = {
  method: Method;
  path: string;
  requestBody: B;
  params: P;
  queries: Q;
  responseData: R;
};

export const createRoute = <
  B extends z.ZodTypeAny,
  R extends z.ZodTypeAny,
  P extends z.ZodTypeAny,
  Q extends z.ZodTypeAny,
>(
  config: RouteConfig<B, R, P, Q>,
) => {
  const responseSchema = z.object({
    message: z.string(),
    data: config.responseData.optional(),
  });

  return {
    ...config,
    responseSchema,
  };
};

export type Route = ReturnType<typeof createRoute>;
