import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { Routes } from "@chat/shared";
import { apiFetch } from "../fetch-wrapper";

export const getNotifications = () =>
  infiniteQueryOptions({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      apiFetch(Routes.getNotifications, {
        headers: { credentials: "include" },
        params: {},
        queries: { cursor: pageParam as string | undefined, take: 20 },
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.data?.nextCursor,
  });

export const getUnreadCount = () =>
  queryOptions({
    queryKey: ["notifications", "unread-count"],
    queryFn: () =>
      apiFetch(Routes.getUnreadNotificationCount, {
        headers: { credentials: "include" },
        params: {},
      }),
    refetchInterval: 30_000,
  });
