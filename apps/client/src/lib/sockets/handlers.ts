import { queryClient } from "@/main";
import { Routes, type PublicMessageSchema } from "@chat/shared";
import { toast } from "sonner";
import type z from "zod";

export async function onMessageCreate(message: PublicMessageSchema) {
  toast.info("Message recieved from " + message.author.name);
  await queryClient.invalidateQueries({
    queryKey: ["conversations"],
  });
}
export async function onMessageRead() {
  await queryClient.invalidateQueries({
    queryKey: ["conversations"],
  });
}
export async function onMessageConfirm(
  conversationId: string,
  message: PublicMessageSchema,
  tempId: string,
) {
  await queryClient.setQueryData(
    ["conversations", conversationId],
    (oldData: z.infer<typeof Routes.getConversationById.responseSchema>) => {
      if (!oldData?.data) return oldData;

      const updatedMessages = oldData.data.messages.map((m) => {
        if (m.clientId === tempId) {
          return {
            ...message,
            clientId: tempId,
          };
        }
        return m;
      });

      return {
        ...oldData,
        data: { ...oldData.data, messages: updatedMessages },
      };
    },
  );
}
