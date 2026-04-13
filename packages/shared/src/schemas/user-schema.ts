import { UserSchema } from "@chat/db/schemas";
import z from "zod";

export const PublicUserSchema = UserSchema.pick({
  id: true,
  name: true,
  imgUrl: true,
  bio: true,
  lastSeen: true,
});

export type PublicUserSchema = z.infer<typeof PublicUserSchema>;
