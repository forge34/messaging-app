import { UserModelSchema } from "@chat/db/schemas";

export const PublicUserSchema = UserModelSchema.pick({
  id: true,
  name: true,
  imgUrl: true,
});
