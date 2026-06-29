import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { getNotifications } from "@/lib/queries/notifications";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/lib/mutations/notifications";
import { NotificationItem } from "./notification-item";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { type UIEvent } from "react";

export function NotificationDropdown() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(getNotifications());
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const navigate = useNavigate();

  const notifications =
    data?.pages.flatMap((p) => p?.data?.notifications ?? []) ?? [];

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  return (
    <div className="flex flex-col min-h-0 h-full max-h-[inherit]">
      <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
        <span className="text-sm font-semibold">Notifications</span>
        {notifications.some((n) => !n.readAt) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all read
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0" onScroll={handleScroll}>
        <div className="flex flex-col">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notifications
            </p>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                id={n.id}
                type={n.type}
                title={n.title}
                body={n.body}
                readAt={n.readAt}
                createdAt={n.createdAt}
                onClick={() => {
                  if (!n.readAt) markRead.mutate(n.id);
                  const conversationId = n.data?.conversationId;
                  if (conversationId) {
                    navigate({
                      to: "/app/conversations/$conversationId",
                      params: { conversationId },
                    });
                  }
                }}
              />
            ))
          )}
          {isFetchingNextPage && (
            <div className="flex justify-center py-2">
              <Spinner />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
