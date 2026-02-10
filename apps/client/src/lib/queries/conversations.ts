import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../utils";
import { Routes } from "@chat/shared";

export const getCurrentUserConversations = () =>
  queryOptions({
    queryKey: ["conversations"],
    queryFn: async () => {
      return apiFetch(Routes.getCurrentUserConversations, {
        headers: {
          credentials: "include",
        },
        params: {},
      });
    },
  });

export const GetConversationById = (id: string) =>
  queryOptions({
    queryKey: ["conversations", id],
    queryFn: async () => {
      return apiFetch(Routes.getConversationById, {
        headers: {
          credentials: "include",
        },
        params: {
          id,
        },
      });
    },
  });
