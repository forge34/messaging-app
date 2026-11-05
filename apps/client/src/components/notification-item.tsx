import { MessageCircle, Smile } from "lucide-react";
import { relativeTime } from "@/lib/format";

type NotificationItemProps = {
  id: string;
  type: "MESSAGE" | "REACTION";
  title: string;
  body: string | null | undefined;
  readAt: Date | null;
  createdAt: Date | string;
  onClick: () => void;
};

export function NotificationItem({
  type,
  title,
  body,
  readAt,
  createdAt,
  onClick,
}: NotificationItemProps) {
  const isUnread = !readAt;

  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 w-full text-left px-4 py-3 transition-colors hover:bg-muted/50 ${
        isUnread ? "bg-muted/20 border-l-2 border-l-primary" : ""
      }`}
    >
      <span className="mt-0.5 shrink-0">
        {type === "REACTION" ? (
          <Smile className="w-4 h-4 text-yellow-500" />
        ) : (
          <MessageCircle className="w-4 h-4 text-blue-500" />
        )}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm truncate ${isUnread ? "font-semibold" : "font-medium text-muted-foreground"}`}
        >
          {title}
        </p>
        {body && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {body}
          </p>
        )}
      </div>
      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
        {relativeTime(createdAt)}
      </span>
    </button>
  );
}
