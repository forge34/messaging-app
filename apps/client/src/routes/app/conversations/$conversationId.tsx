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
import { X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Route as MeRoute } from "./@me.tsx";
import { socket } from "@/lib/sockets/index.ts";

export const Route = createFileRoute("/app/conversations/$conversationId")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params: { conversationId } }) => {
    const data = await queryClient.ensureQueryData(
      GetConversationById(conversationId),
    );

    return data;
  },
});

function RouteComponent() {
  const { conversationId } = Route.useParams();
  const { data } = useQuery(GetConversationById(conversationId));
  const navigate = useNavigate();

  const router = useRouter();
  const [typing, setTyping] = useState({
    typing: false,
    name: "",
  });
  const conversation = data?.data;

  useEffect(() => {
    if (!conversation?.messages?.length) return;

    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (window.location.hash !== `#${lastMessage.id}`) {
      navigate({
        hash: lastMessage.id,
        replace: true,
      });
    }
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
    if (!conversationId) return;
    socket.emit("message:read", conversationId);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("typing", handleTyping);
      clearTimeout(timeoutId);
    };
  }, [conversationId]);

  return (
    <AnimatedRoute
      key={router.state.location.pathname}
      variant="slide"
      className="h-full flex flex-col "
    >
      <div className="flex flex-row py-2 px-4 border-b items-center">
        <X
          className="h-6 w-6 mr-2"
          onClick={() => {
            navigate({ to: MeRoute.to });
          }}
        />
        <h3 className="text-xl font-semibold">{conversation?.title}</h3>
      </div>
      <div className="flex flex-col gap-y-4 py-4 px-6 flex-1 overflow-y-scroll">
        <AnimatePresence initial={false}>
          {conversation?.messages.map((msg) => {
            return <Message message={msg} key={msg.clientId || msg.id} />;
          })}
        </AnimatePresence>
      </div>
      {typing.typing && (
        <h3 className="text-sm text-muted-foreground mx-4 my-2">
          {typing.name + " is typing..."}
        </h3>
      )}
      <MessageInput conversationId={conversationId} />
    </AnimatedRoute>
  );
}
