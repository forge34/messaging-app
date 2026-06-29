import { Routes } from "@chat/shared";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
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
  infiniteQueryOptions({
    queryKey: ["users"],
    queryFn: ({ pageParam }) =>
      apiFetch(Routes.getUsers, {
        headers: { credentials: "include" },
        params: {},
        queries: { cursor: pageParam as string | undefined, take: 20 },
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.data?.nextCursor,
  });
