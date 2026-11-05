import { Routes } from "@chat/shared";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../fetch-wrapper";

export const getUserById = (id: string) =>
  queryOptions({
    queryKey: ["user", id],
    queryFn: async () => {
      return apiFetch(Routes.getUserById, {
        params: { id },
      });
    },
  });

export const getUsers = () =>
  infiniteQueryOptions({
    queryKey: ["users"],
    queryFn: ({ pageParam }) =>
      apiFetch(Routes.getUsers, {
        params: {},
        queries: { cursor: pageParam as string | undefined, take: 20 },
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.data?.nextCursor,
  });
