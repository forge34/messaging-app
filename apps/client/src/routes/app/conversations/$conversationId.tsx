import { AnimatedRoute } from "@/components/animated-route";
import { Message } from "@/components/message";
import { MessageInput } from "@/components/message-input";
import { GetConversationById } from "@/lib/queries/conversations";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Route as MeRoute } from "./@me.tsx";
import { socket } from "@/lib/sockets/index.ts";
import { Route as ConversationRoute } from "./route.tsx";
import { useBreakpoint } from "@/lib/hooks/use-match-media.tsx";
import { getMe } from "@/lib/queries/auth.ts";
import { useOnlineUsers } from "@/lib/context/online-users.tsx";

export const Route = createFileRoute("/app/conversations/$conversationId")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params: { conversationId } }) => {
    const data = await queryClient.ensureQueryData(
      GetConversationById(conversationId),
    );
    return data;
  },
});

function getLastSeenText(lastSeen?: Date | null) {
  if (!lastSeen) return null;

  const date = new Date(lastSeen);
  const diffMs = Date.now() - date.getTime();

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "Last seen just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return `Last seen ${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Last seen ${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  return `Last seen ${days} day${days > 1 ? "s" : ""} ago`;
}

function RouteComponent() {
  const { conversationId } = Route.useParams();
  const { data } = useQuery(GetConversationById(conversationId));
  const navigate = useNavigate();
  const router = useRouter();
  const { md } = useBreakpoint();
  const { data: currentUserData } = useQuery(getMe());
  const { isOnline } = useOnlineUsers();
  const currentUser = currentUserData?.data;
  const [typing, setTyping] = useState({
    typing: false,
    name: "",
  });
  const conversation = data?.data;

  useEffect(() => {
    if (!conversation?.messages?.length) return;
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    navigate({
      hash: lastMessage.id,
      replace: true,
    });
  }, [conversation?.messages, navigate]);

  useEffect(() => {
    let timeoutId: number;
    function handleTyping(name: string) {
      setTyping({ typing: true, name });
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setTyping({ typing: false, name: "" });
      }, 3000);
    }
    function handleTypingStop() {
      console.log("stop typing");
      setTyping({ typing: false, name: "" });
    }
    if (!conversationId) return;
    socket.emit("message:read", conversationId);
    socket.on("typing", handleTyping);
    socket.on("typing:stop", handleTypingStop);
    return () => {
      socket.off("typing", handleTyping);
      socket.off("typing:stop", handleTypingStop);
      clearTimeout(timeoutId);
    };
  }, [conversationId]);

  const otherUser = conversation?.users.find((u) => u.id !== currentUser?.id);
  if (!otherUser) return;

  const lastSeenText = getLastSeenText(otherUser?.lastSeen);
  const OnlineText = isOnline(otherUser.id!) ? "Online" : null;
  return (
    <AnimatedRoute
      key={router.state.location.pathname}
      variant="slide"
      className="h-full flex flex-col"
    >
      <div className="flex flex-row py-3 px-4 border-b items-center gap-2">
        <button
          onClick={() => {
            navigate({ to: md ? MeRoute.to : ConversationRoute.to });
          }}
          className="p-1 hover:bg-accent rounded-md transition-colors"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        <div className="flex flex-col min-w-0">
          <h3 className="text-lg md:text-xl font-semibold truncate">
            {conversation?.title}
          </h3>

          {(OnlineText || lastSeenText) && (
            <span className="text-xs text-muted-foreground truncate">
              {OnlineText || lastSeenText}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-y-4 py-4 px-3 md:px-6 flex-1 overflow-y-scroll">
        <AnimatePresence initial={false}>
          {conversation?.messages.map((msg) => {
            return <Message message={msg} key={msg.clientId || msg.id} />;
          })}
        </AnimatePresence>
      </div>
      {typing.typing && (
        <AnimatePresence>
          <motion.h3
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="flex items-center font-semibold text-sm text-muted-foreground mx-3 md:mx-4 my-2"
          >
            {typing.name} is typing
            <span className="flex ml-1 space-x-1">
              <span className="animate-bounce [animation-delay:-0.3s]">.</span>
              <span className="animate-bounce [animation-delay:-0.15s]">.</span>
              <span className="animate-bounce">.</span>
            </span>
          </motion.h3>
        </AnimatePresence>
      )}
      <MessageInput conversationId={conversationId} />
    </AnimatedRoute>
  );
}
