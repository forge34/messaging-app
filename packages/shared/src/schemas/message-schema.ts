import {
  MessageReceiptSchema,
  MessageReactionsSchema,
  MessageSchema,
  MessageAttachmentSchema,
} from "@chat/db/schemas";
import z from "zod";
import { PublicUserSchema } from "./user-schema.js";

export const PublicMessageAttachmentSchema = MessageAttachmentSchema.pick({
  id: true,
  type: true,
  url: true,
  publicId: true,
  format: true,
  width: true,
  height: true,
  bytes: true,
});

export type PublicMessageAttachmentSchema = z.infer<
  typeof PublicMessageAttachmentSchema
>;

export const PublicMessageReceiptsSchema = MessageReceiptSchema;

export type PublicMessageReceiptsSchema = z.infer<
  typeof PublicMessageReceiptsSchema
>;

export const PublicMessageReactionsSchema = MessageReactionsSchema;

export type PublicMessageReactionsSchema = z.infer<
  typeof PublicMessageReactionsSchema
>;

export const messageExtra = z.object({
  isMine: z.boolean(),
  isBookmarked: z.boolean(),
  clientId: z.string().optional(),
});

export const baseMessageSchema = MessageSchema.pick({
  id: true,
  conversationId: true,
  authorId: true,
  body: true,
  createdAt: true,
  status: true,
  parentMessageId: true,
}).extend({
  author: PublicUserSchema,
  attachment: PublicMessageAttachmentSchema.nullable().optional(),
  messageReceipts: z.array(PublicMessageReceiptsSchema),
  messageReactions: z.array(PublicMessageReactionsSchema),
  deliveredAt: z.date().nullable().optional(),
  bookmarkedBy: z.array(PublicUserSchema),
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
      attachment: PublicMessageAttachmentSchema.nullable().optional(),
    })
    .optional()
    .nullable(),
});

export const PublicMessageSchema = z.object({
  ...baseMessageSchema.shape,
  ...messageExtra.shape,
});

export type PublicMessageSchema = z.infer<typeof PublicMessageSchema>;
