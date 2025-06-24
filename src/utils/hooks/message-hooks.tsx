import { useMutation } from "@tanstack/react-query";
import { bookmarkMessage, deleteMessage } from "../mutations/messages";
import { queryClient } from "../../router";

const useDeleteMessage = (conversationId: string) =>
  useMutation({
    mutationFn: deleteMessage,
    retry: false,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["conversations", conversationId],
      });
    },
  });

const useBookmarkMessage = () =>
  useMutation({
    mutationFn: bookmarkMessage,
    retry: false,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["bookmarks"],
      });
    },
  });

export { useDeleteMessage, useBookmarkMessage };
