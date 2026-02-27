import { Link } from "@tanstack/react-router";
import type { ConversationListSchema } from "@chat/shared";
import { Search, Users } from "lucide-react";
import { Input } from "./ui/input";
import { Route as ConversationIdRoute } from "../routes/app/conversations/$conversationId.tsx";
import { Button } from "./ui/button";
import { useBreakpoint } from "@/lib/hooks/use-match-media.tsx";
import { useOnlineUsers } from "@/lib/context/online-users.tsx";

export function DirectMessageList({
  conversations,
}: {
  conversations: ConversationListSchema[] | undefined;
}) {
  const { md } = useBreakpoint();
  const { isOnline } = useOnlineUsers();
  if (!conversations || conversations.length === 0) {
    return (
      <div className="divide-y divide-border py-3 px-3 md:px-4 border-r md:col-span-2 w-full md:w-auto flex flex-col h-full">
        <Header md={md} />
        <div className="p-6 text-sm text-muted-foreground">
          No conversations yet.
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border py-3 px-3 md:px-4 border-r md:col-span-2 w-full md:w-auto flex flex-col h-full">
      <Header md={md} />
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation: ConversationListSchema) => {
          const {
            id,
            title,
            lastMessage,
            lastMessageAt,
            otherUser,
            createdAt,
          } = conversation;

          return (
            <Link
              key={id}
              to={ConversationIdRoute.to}
              params={{ conversationId: id }}
              className="flex items-center gap-3 px-2 md:px-3 py-3 w-full text-left hover:brightness-110 hover:bg-background/30 transition-all rounded-md"
            >
              <div className="h-10 w-10 rounded-full shrink-0 relative ">
                <img
                  src={otherUser.imgUrl ?? "/avatar-placeholder.png"}
                  alt={otherUser.name}
                  className="object-cover "
                />
                {isOnline(otherUser.id) && (
                  <div className="w-3 h-3 rounded-full bg-green-500 absolute top-0 right-0" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate text-sm md:text-base">
                    {title}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(lastMessageAt || createdAt).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>
                {lastMessage && (
                  <div className="text-xs md:text-sm text-muted-foreground truncate">
                    <span className="font-medium">
                      {lastMessage.author.name}:{" "}
                    </span>
                    {lastMessage.body}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Header({ md }: { md: boolean }) {
  return (
    <div className="flex flex-row items-center gap-2 pb-3">
      <Input
        className="bg-background rounded-md flex-1"
        icon={<Search className="h-4 w-4" />}
        placeholder="Search conversations"
      />
      {!md && (
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label="View all users"
          asChild
        >
          <Link to="/app/conversations/@me">
            <Users className="w-5 h-5" />
          </Link>
        </Button>
      )}
    </div>
  );
}
