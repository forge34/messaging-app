import { queryClient } from "@/main";
import type { ServerToClientEvents } from "@chat/shared";
import { toast } from "sonner";

export function onNotificationCreate(
  ...args: Parameters<ServerToClientEvents["notification:create"]>
) {
  const [notification] = args;

  queryClient.setQueryData(
    ["notifications", "unread-count"],
    (old: { data?: { count: number } } | undefined) => {
      const current = old?.data?.count ?? 0;
      return { ...old, data: { count: current + 1 } };
    },
  );

  queryClient.setQueryData(
    ["notifications"],
    (old: { pages: { data: { notifications: unknown[] } }[] } | undefined) => {
      if (!old) return old;
      const [first, ...rest] = old.pages;
      return {
        ...old,
        pages: [
          {
            ...first,
            data: {
              ...first.data,
              notifications: [notification, ...first.data.notifications],
            },
          },
          ...rest,
        ],
      };
    },
  );

  toast.info(notification.title);
}

export function onUnreadCount(count: number) {
  queryClient.setQueryData(
    ["notifications", "unread-count"],
    (old: { data?: { count: number } } | undefined) => ({
      ...old,
      data: { count },
    }),
  );
}
