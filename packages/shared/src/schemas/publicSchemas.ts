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
    bookmarkedBy: z.array(PublicUserSchema),
    isMine: z.boolean(),
    isBookmarked: z.boolean(),
  })
  .strict();

export const PublicConversationSchema = ConversationModelSchema.pick({
  id: true,
  createdAt: true,
  updatedAt: true,
})
  .extend({
    users: z.array(PublicUserSchema),
    messages: z.array(PublicMessageSchema),
    title: z.string().nonempty(),
    lastMessage: PublicMessageSchema,
    lastMessageAt: z.date(),
  })
  .strict();
