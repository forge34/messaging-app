import {
  ConversationModelSchema,
  MessageModelSchema,
  MessageReactionsModelSchema,
  MessageReceiptModelSchema,
  UserModelSchema,
} from "@chat/db/schemas";
import z from "zod";

export const PublicUserSchema = UserModelSchema.pick({
  id: true,
  name: true,
  imgUrl: true,
  bio: true,
}).strict();

export type PublicUserSchema = z.infer<typeof PublicUserSchema>;

export const PublicMessageReceiptsSchema = MessageReceiptModelSchema.omit({
  user: true,
  message: true,
});

export type PublicMessageReceiptsSchema = z.infer<
  typeof PublicMessageReceiptsSchema
>;

export const PublicMessageReactionsSchema = MessageReactionsModelSchema.omit({
  user: true,
  message: true,
});

export type PublicMessageReactionsSchema = z.infer<
  typeof PublicMessageReactionsSchema
>;

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
    messageReceipts: z.array(PublicMessageReceiptsSchema),
    messageReactions: z.array(PublicMessageReactionsSchema),
    isMine: z.boolean(),
    isBookmarked: z.boolean(),
    clientId: z.string().optional(),
    deliveredAt: z.date().nullable().optional(),
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
  }).nullable(),
  lastMessageAt: z.date().nullable(),
  otherUser: PublicUserSchema,
});

export type ConversationListSchema = z.infer<typeof ConversationListSchema>;

export const FullUserSchema = UserModelSchema.omit({
  password: true,
  messageReceipts: true,
  messageReactions: true,
}).extend({
  blocked: z.array(PublicUserSchema),
  blockedBy: z.array(PublicUserSchema),
  messages: z.array(
    PublicMessageSchema.omit({
      author: true,
      isMine: true,
      isBookmarked: true,
      deliveredAt: true,
      messageReceipts: true,
      messageReactions: true,
    }),
  ),
  bookmarks: z.array(
    PublicMessageSchema.omit({
      author: true,
      isMine: true,
      isBookmarked: true,
      deliveredAt: true,
      messageReceipts: true,
      messageReactions: true,
    }),
  ),
});
