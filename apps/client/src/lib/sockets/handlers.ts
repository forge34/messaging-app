import { queryClient } from "@/main";
import type { PublicMessageSchema } from "@chat/shared";
import { toast } from "sonner";

export async function onMessageCreate(
  message: PublicMessageSchema,
  conversationId: string,
) {
  toast.info("Messae recieved from " + message.author.name);
  queryClient.invalidateQueries({
    queryKey: ["conversations", conversationId],
  });
}

export async function onMessageConfirm(
  message: PublicMessageSchema,
  conversationId: string,
  tempId: string,
) {
  console.log(message, tempId);
  queryClient.invalidateQueries({
    queryKey: ["conversations", conversationId],
  });
}
