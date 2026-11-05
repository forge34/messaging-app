import type { ServerToClientEvents } from "@chat/shared";
import { toast } from "sonner";
import {
  incrementUnreadCount,
  prependNotification,
  setUnreadCount,
} from "@/lib/cache";

export function onNotificationCreate(
  ...args: Parameters<ServerToClientEvents["notification:create"]>
) {
  const [notification] = args;

  incrementUnreadCount();
  prependNotification(notification);
  toast.info(notification.title);
}

export function onUnreadCount(count: number) {
  setUnreadCount(count);
}
