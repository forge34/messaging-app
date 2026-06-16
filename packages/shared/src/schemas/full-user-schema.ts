import { UserSchema } from "@chat/db/schemas";
import z from "zod";
import { PublicUserSchema } from "./user-schema.js";
import { PublicConversationSchema } from "./conversation-schema.js";
import { PublicMessageSchema } from "./message-schema.js";

export const FullUserSchema = UserSchema.omit({
  password: true,
}).extend({
  blocked: z.array(PublicUserSchema),
  blockedBy: z.array(PublicUserSchema),
  conversations: z.array(
    PublicConversationSchema.pick({
      id: true,
      createdAt: true,
      updatedAt: true,
    }),
  ),
  messages: z.array(
    PublicMessageSchema.omit({
      author: true,
      isMine: true,
      isBookmarked: true,
      deliveredAt: true,
      messageReceipts: true,
      messageReactions: true,
      parentMessage: true,
      bookmarkedBy: true,
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
      bookmarkedBy: true,
    }),
  ),
});
