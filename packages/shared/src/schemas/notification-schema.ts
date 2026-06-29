import { NotificationSchema } from "@chat/db/schemas";
import { PublicUserSchema } from "./user-schema.js";
import z from "zod";

export const PublicNotificationSchema = NotificationSchema.pick({
  id: true,
  type: true,
  title: true,
  body: true,
  createdAt: true,
}).extend({
  data: z
    .object({
      conversationId: z.string(),
      messageId: z.string(),
    })
    .nullable(),
  readAt: z.coerce.date().nullable(),
  actor: PublicUserSchema.nullable(),
});

export type PublicNotification = z.infer<typeof PublicNotificationSchema>;
