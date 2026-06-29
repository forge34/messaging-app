import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Routes } from "@chat/shared";
import { apiFetch } from "../fetch-wrapper";

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(Routes.markNotificationRead, {
        headers: { credentials: "include" },
        params: { id },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch(Routes.markAllNotificationsRead, {
        headers: { credentials: "include" },
        params: {},
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
