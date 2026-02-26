import { useMutation } from "@tanstack/react-query";
import { Routes } from "@chat/shared";
import { toast } from "sonner";
import { queryClient } from "@/main";
import { Route as ConversatonIdRoute } from "../../routes/app/conversations/$conversationId.tsx";
import { apiFetch } from "../fetch-wrapper.ts";
import { useNavigate } from "@tanstack/react-router";

export const useCreateConversation = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (otherId: string) => {
      return apiFetch(Routes.createConversation, {
        body: {
          otherId,
        },
        headers: {
          credentials: "include",
        },
        params: {},
      });
    },
    onSuccess: async (data) => {
      if (!data) return;

      toast.success("Conversaton created");
      await queryClient.refetchQueries({ queryKey: ["conversatons"] });
      if (data.data?.id) {
        navigate({
          to: ConversatonIdRoute.to,
          params: {
            conversationId: data.data?.id,
          },
        });
      }
    },
  });
};
