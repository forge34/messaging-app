import {
  ConversationModelSchema,
  MessageModelSchema,
  UserModelSchema,
} from "@chat/db/schemas";
import z from "zod";

export const PublicUserSchema = UserModelSchema.pick({
  id: true,
  name: true,
  imgUrl: true,
  bio: true,
}).strict();

export const PublicMessageSchema = MessageModelSchema.pick({
  id: true,
  conversationId: true,
  authorId: true,
  body: true,
  createdAt: true,
  status: true,
})
  .extend({
    author: PublicUserSchema,
    isMine: z.boolean(),
    isBookmarked: z.boolean(),
  })
  .strict();

export type PublicMessageSchema = z.infer<typeof PublicMessageSchema>;

export const PublicConversationSchema = ConversationModelSchema.pick({
  id: true,
  createdAt: true,
  updatedAt: true,
})
  .extend({
    users: z.array(PublicUserSchema),
    messages: z.array(PublicMessageSchema),
    title: z.string().nonempty(),
  })
  .strict();

export type PublicConversationSchema = z.infer<typeof PublicConversationSchema>;

export const ConversationListSchema = PublicConversationSchema.omit({
  messages: true,
}).extend({
  lastMessage: PublicMessageSchema.pick({
    id: true,
    body: true,
    createdAt: true,
    status: true,
    author: true,
  }),
  lastMessageAt: z.date(),
});

export type ConversationListSchema = z.infer<typeof ConversationListSchema>;
