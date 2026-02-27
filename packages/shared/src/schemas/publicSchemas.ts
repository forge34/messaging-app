import {
  ConversationSchema,
  MessageReactionsSchema,
  MessageReceiptSchema,
  MessageSchema,
  UserSchema,
} from "@chat/db/schemas";
import z from "zod";

export const PublicUserSchema = UserSchema.pick({
  id: true,
  name: true,
  imgUrl: true,
  bio: true,
  lastSeen: true,
}).strict();

export type PublicUserSchema = z.infer<typeof PublicUserSchema>;

export const PublicMessageReceiptsSchema = MessageReceiptSchema;

export type PublicMessageReceiptsSchema = z.infer<
  typeof PublicMessageReceiptsSchema
>;

export const PublicMessageReactionsSchema = MessageReactionsSchema;

export type PublicMessageReactionsSchema = z.infer<
  typeof PublicMessageReactionsSchema
>;

export const PublicMessageSchema = MessageSchema.pick({
  id: true,
  conversationId: true,
  authorId: true,
  body: true,
  createdAt: true,
  status: true,
  parentMessageId: true,
})
  .extend({
    author: PublicUserSchema,
    messageReceipts: z.array(PublicMessageReceiptsSchema),
    messageReactions: z.array(PublicMessageReactionsSchema),
    isMine: z.boolean(),
    isBookmarked: z.boolean(),
    clientId: z.string().optional(),
    deliveredAt: z.date().nullable().optional(),
    parentMessage: MessageSchema.pick({
      id: true,
      conversationId: true,
      authorId: true,
      body: true,
      createdAt: true,
      status: true,
    })
      .extend({
        author: PublicUserSchema.omit({ lastSeen: true }),
      })
      .optional()
      .nullable(),
  })
  .strict();

export type PublicMessageSchema = z.infer<typeof PublicMessageSchema>;

export const PublicConversationSchema = ConversationSchema.pick({
  id: true,
  createdAt: true,
  updatedAt: true,
})
  .extend({
    users: z.array(PublicUserSchema),
    messages: z.array(PublicMessageSchema),
    title: z.string().nonempty(),
    lastSeen: z.coerce.date().optional(),
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
  lastMessageAt: z.coerce.date().nullable(),
  otherUser: PublicUserSchema,
});

export type ConversationListSchema = z.infer<typeof ConversationListSchema>;

export const FullUserSchema = UserSchema.omit({
  password: true,
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
      parentMessage: true,
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
      parentMessage: true,
    }),
  ),
});
