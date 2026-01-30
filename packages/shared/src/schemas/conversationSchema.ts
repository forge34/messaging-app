import { ConversationModelSchema, MessageModelSchema } from "@chat/db/schemas";
import z from "zod";
import { PublicUserSchema } from "./userSchema.js";

export const PublicExtendedConversationSchema = ConversationModelSchema.pick({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  users: z.array(PublicUserSchema),
  messages: z.array(
    MessageModelSchema.pick({
      id: true,
      conversationId: true,
      authorId: true,
      body: true,
    }).extend({
      author: PublicUserSchema,
    }),
  ),
  title: z.string().nonempty(),
});

export const CreateConversationResponseSchema = ConversationModelSchema.pick({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const GetCurrentUserConversationResponseSchema = z.array(
  PublicExtendedConversationSchema,
);
