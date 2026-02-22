import { queryClient } from "@/main";
import type { PublicMessageSchema } from "@chat/shared";
import { toast } from "sonner";

export async function onMessageCreate(message: PublicMessageSchema) {
  toast.info("Message recieved from " + message.author.name);
  queryClient.invalidateQueries({
    queryKey: ["conversations"],
  });
}

export async function onMessageConfirm(
  message: PublicMessageSchema,
  _: string,
  tempId: string,
) {
  console.log(message, tempId);
  queryClient.invalidateQueries({
    queryKey: ["conversations"],
  });
}
