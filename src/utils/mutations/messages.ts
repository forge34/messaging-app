import { safeFetch } from "../functions";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../router";
import toast from "react-hot-toast";

const bookmarkMessage = async (id: string) => {
  await safeFetch(`${import.meta.env.VITE_API}/message/${id}/bookmark`, {
    method: "post",
  });
};

const useBookmarkMessage = () =>
  useMutation({
    mutationFn: bookmarkMessage,
    retry: false,
    onSuccess() {
      toast("Message bookmarked", {
        icon: "⭐",
        duration: 1000,
      });
      queryClient.invalidateQueries({
        queryKey: ["bookmarks"],
      });
    },
  });

export { bookmarkMessage, useBookmarkMessage };
