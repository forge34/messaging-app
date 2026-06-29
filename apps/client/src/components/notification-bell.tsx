import { useQuery } from "@tanstack/react-query";
import { Bell, BellDot } from "lucide-react";
import { getUnreadCount } from "@/lib/queries/notifications";
import { NotificationDropdown } from "./notification-dropdown";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function NotificationBell() {
  const { data } = useQuery(getUnreadCount());
  const count = data?.data?.count ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted hover:text-foreground text-muted-foreground w-full relative">
          {count > 0 ? (
            <BellDot className="w-5 h-5 text-primary" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          <span>Notifications</span>
          {count > 0 && (
            <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-in zoom-in-50 duration-200">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="p-0 w-80 max-h-[60vh] h-112.5 overflow-hidden flex flex-col"
      >
        <NotificationDropdown />
      </PopoverContent>
    </Popover>
  );
}
