import { useMutation } from "@tanstack/react-query";
import { createConversation } from "../mutations/conversations";
import { queryClient } from "../../router";
import {  useNavigate } from "react-router-dom";
import { ConversationSchema } from "../schema";

function useCreateConvertion() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: createConversation,
    onSuccess: async ({
      conversation,
    }: {
      conversation: ConversationSchema;
    }) => {
      await queryClient.invalidateQueries();
      navigate(`/conversations/${conversation.id}`);
    },
  });
}

export { useCreateConvertion };
