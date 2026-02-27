import z from "zod";
import { PublicMessageSchema } from "../schemas/publicSchemas.js";
import { createEvent, EventMap } from "./schemas.js";

export type OnlineUsers = Map<
  string,
  { isOnline: boolean; timerId: NodeJS.Timeout | null }
>;

export const ServerEvents = {
  "message:create": createEvent({
    name: "message:create",
    input: z.tuple([z.string(), PublicMessageSchema.partial(), z.string()]),
  }),

  "message:delete": createEvent({
    name: "message:delete",
    input: z.tuple([z.string(), z.string()]),
  }),

  "message:read": createEvent({
    name: "message:read",
    input: z.tuple([z.string(), z.array(z.string())]),
  }),

  "message:create:confirm": createEvent({
    name: "message:create:confirm",
    input: z.tuple([z.string(), PublicMessageSchema.partial(), z.string()]),
  }),

  typing: createEvent({
    name: "typing",
    input: z.tuple([z.string()]),
  }),

  "typing:stop": createEvent({
    name: "typing:stop",
    input: z.tuple([]),
  }),

  "message:reaction": createEvent({
    name: "message:reaction",
    input: z.tuple([z.string(), PublicMessageSchema.partial()]),
  }),

  "users:presence_update": createEvent({
    name: "users:presence_update",
    input: z.tuple([z.array(z.string())]),
  }),
} as const;

export type ServerToClientEvents = EventMap<typeof ServerEvents>;

export const ClientEvents = {
  "message:create": createEvent({
    name: "message:create",
    input: z.tuple([
      PublicMessageSchema.partial(),
      z.string(),
      z.string(),
      z.string().nullable().optional(),
    ]),
  }),

  "message:delete": createEvent({
    name: "message:delete",
    input: z.tuple([z.string(), z.string()]),
  }),

  "message:read": createEvent({
    name: "message:read",
    input: z.tuple([z.string()]),
  }),

  typing: createEvent({
    name: "typing",
    input: z.tuple([z.string(), z.string()]),
  }),

  "typing:stop": createEvent({
    name: "typing:stop",
    input: z.tuple([z.string()]),
  }),

  "message:reaction": createEvent({
    name: "message:reaction",
    input: z.tuple([z.string(), z.string(), z.string()]),
  }),
} as const;

export type ClientToServerEvents = EventMap<typeof ClientEvents>;
