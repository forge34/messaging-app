import { queryClient } from "@/main";
import type { PublicMessageSchema } from "@chat/shared";
import { toast } from "sonner";

export async function onMessageCreate(message : PublicMessageSchema, conversationId: string) {
  toast.info("Messae recieved from " + message.author.name)
  queryClient.invalidateQueries({
    queryKey: ["conversations", conversationId],
  });
}

export async function onMessageConfirm(message, conversationId : string, tempId : string) {
  queryClient.invalidateQueries({
    queryKey: ["conversations", conversationId],
  });
}
