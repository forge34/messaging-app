import z, { ZodTuple } from "zod";

export interface SocketEvent<TName extends string, TSchema extends ZodTuple> {
  name: TName;
  input: TSchema;
}

export function createEvent<TName extends string, TSchema extends ZodTuple>(
  event: SocketEvent<TName, TSchema>,
) {
  return event;
}

export type EventMap<T extends Record<string, SocketEvent<string, ZodTuple>>> =
  {
    [k in keyof T]: (...args: z.infer<T[k]["input"]>) => void | Promise<void>;
  };
