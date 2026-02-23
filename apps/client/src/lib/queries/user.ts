import { Routes } from "@chat/shared";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../fetch-wrapper";

export const getUserById = (id: string) =>
  queryOptions({
    queryKey: ["user", id],
    queryFn: async () => {
      return apiFetch(Routes.getUserById, {
        headers: {
          credentials: "include",
        },
        params: { id },
      });
    },
  });

export const getUsers = () =>
  queryOptions({
    queryKey: ["users"],
    queryFn: async () => {
      return apiFetch(Routes.getUsers, {
        headers: {
          credentials: "include",
        },
        params : {}
      });
    },
  });
