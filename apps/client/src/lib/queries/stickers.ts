import { queryOptions } from "@tanstack/react-query";
import { Routes } from "@chat/shared";
import { apiFetch } from "../fetch-wrapper";

export const getStickers = () =>
  queryOptions({
    queryKey: ["stickers"],
    queryFn: async () => {
      return apiFetch(Routes.listStickers, {
        headers: {
          credentials: "include",
        },
        params: {},
      });
    },
    staleTime: 1000 * 60 * 5,
  });
