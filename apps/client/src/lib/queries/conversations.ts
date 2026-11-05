import { queryOptions } from "@tanstack/react-query";
import { Routes } from "@chat/shared";
import { apiFetch } from "../fetch-wrapper";

export const getCurrentUserConversations = () =>
  queryOptions({
    queryKey: ["conversations"],
    queryFn: async () => {
      return apiFetch(Routes.getCurrentUserConversations, {
        params: {},
      });
    },
  });

export const GetConversationById = (id: string) =>
  queryOptions({
    queryKey: ["conversations", id],
    queryFn: async () => {
      return apiFetch(Routes.getConversationById, {
        params: {
          id,
        },
      });
    },
  });
