import { ConversationSchema } from "@chat/db/schemas";
import z from "zod";
import { PublicMessageSchema } from "./message-schema.js";
import { PublicUserSchema } from "./user-schema.js";

export const conversationExtra = z.object({
  title: z.string().nonempty(),
  lastSeen: z.coerce.date().optional(),
});

export const baseConversationSchema = ConversationSchema.pick({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  users: z.array(PublicUserSchema),
  messages: z.array(PublicMessageSchema),
});
export const PublicConversationSchema = z.object({
  ...conversationExtra.shape,
  ...baseConversationSchema.shape,
});

export type PublicConversationSchema = z.infer<typeof PublicConversationSchema>;

export const conversationListExtra = z.object({
  lastMessage: PublicMessageSchema.pick({
    id: true,
    body: true,
    createdAt: true,
    status: true,
    author: true,
  }).nullable(),
  lastMessageAt: z.coerce.date().nullable(),
  otherUser: PublicUserSchema,
});

export const baseConversationListSchema = PublicConversationSchema.omit({
  messages: true,
});

export const ConversationListSchema = z.object({
  ...baseConversationListSchema.shape,
  ...conversationListExtra.shape,
});

export type ConversationListSchema = z.infer<typeof ConversationListSchema>;
