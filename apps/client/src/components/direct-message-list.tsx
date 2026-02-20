import { Link } from "@tanstack/react-router";
import type { ConversationListSchema } from "@chat/shared";
import { Search } from "lucide-react";
import { Input } from "./ui/input";

export function DirectMessageList({
  conversations,
}: {
  conversations: ConversationListSchema[] | undefined;
}) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border py-2 px-6 border-r col-span-2">
      <Input
        className="bg-background rounded-md"
        icon={<Search className="h-4 w-4" />}
        placeholder="Search conversations"
      />
      {conversations.map((conversation: ConversationListSchema) => {
        const { id, title, lastMessage, lastMessageAt } = conversation;

        return (
          <Link
            key={id}
            to="/app/conversations/$conversationId"
            params={{ conversationId: id }}
            className="flex items-center gap-3 px-4 py-3 w-full text-left hover:brightness-110 hover:bg-background/30  transition-all delay-0"
          >
            <img
              src={lastMessage.author.imgUrl ?? "/avatar-placeholder.png"}
              alt={lastMessage.author.name}
              className="h-10 w-10 rounded-full object-cover"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">{title}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(lastMessageAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="text-sm text-muted-foreground truncate">
                <span className="font-medium">{lastMessage.author.name}:</span>
                {lastMessage.body}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
