import z, { ZodTuple } from "zod";
import type { SocketAck } from "./errors.js";

export interface SocketEvent<TName extends string, TSchema extends ZodTuple> {
  name: TName;
  input: TSchema;
}

export function createEvent<TName extends string, TSchema extends ZodTuple>(
  event: SocketEvent<TName, TSchema>,
) {
  return event;
}

export type EventObject = Record<string, SocketEvent<string, ZodTuple>>;

export type EventArgs<
  T extends EventObject,
  K extends keyof T,
> = z.infer<T[K]["input"]>;

export type EventMap<T extends EventObject> = {
  [K in keyof T]: (
    ...args: [...EventArgs<T, K>, ack?: SocketAck<unknown>]
  ) => void | Promise<void>;
};
