import z from "zod";
import { createEvent, EventMap } from "./schemas.js";
import { PublicConversationSchema } from "../schemas/conversation-schema.js";
import { PublicMessageSchema } from "../schemas/message-schema.js";

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
    input: z.tuple([z.string(), z.string()]),
  }),

  "typing:stop": createEvent({
    name: "typing:stop",
    input: z.tuple([z.string()]),
  }),

  "message:reaction": createEvent({
    name: "message:reaction",
    input: z.tuple([z.string(), PublicMessageSchema.partial()]),
  }),

  "users:presence_update": createEvent({
    name: "users:presence_update",
    input: z.tuple([z.array(z.string())]),
  }),
  "conversation:create": createEvent({
    name: "conversation:create",
    input: z.tuple([PublicConversationSchema]),
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
  "conversation:create": createEvent({
    name: "conversation:create",
    input: z.tuple([z.string()]),
  }),
} as const;

export type ClientToServerEvents = EventMap<typeof ClientEvents>;
