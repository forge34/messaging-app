import { useMutation } from "@tanstack/react-query";
import { bookmarkMessage } from "../mutations/messages";
import { queryClient } from "../../router";

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

export { useBookmarkMessage };
