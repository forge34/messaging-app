import { Routes } from "@chat/shared";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../fetch-wrapper";

export const getMyProfile = () =>
  queryOptions({
    queryKey: ["user", "me", "profile"],
    queryFn: async () => {
      return apiFetch(Routes.getMyProfile, {
        params: {},
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
