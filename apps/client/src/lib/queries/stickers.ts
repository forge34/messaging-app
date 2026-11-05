import { queryOptions } from "@tanstack/react-query";
import { Routes } from "@chat/shared";
import { apiFetch } from "../fetch-wrapper";

export const getStickers = () =>
  queryOptions({
    queryKey: ["stickers"],
    queryFn: async () => {
      return apiFetch(Routes.listStickers, {
        params: {},
      });
    },
    staleTime: 1000 * 60 * 5,
  });
