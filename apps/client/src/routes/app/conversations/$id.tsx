import { AnimatedRoute } from "@/components/animated-route";
import { Message } from "@/components/message";
import { MessageInput } from "@/components/message-input";
import { GetConversationById } from "@/lib/queries/conversations";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect } from "react";

export const Route = createFileRoute("/app/conversations/$id")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params: { id } }) => {
    const data = await queryClient.ensureQueryData(GetConversationById(id));

    return data;
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data } = useQuery(GetConversationById(id));
  const navigate = useNavigate();

  const router = useRouter();
  const conversation = data?.data;

  useEffect(() => {
    if (!conversation?.messages?.length) return;

    const lastElement = conversation.messages[conversation.messages.length - 1];

    navigate({
      hash: lastElement?.id,
      replace: true,
    });
  });

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
            navigate({ to: "/app/conversations" });
          }}
        />
        <h3 className="text-xl font-semibold">{conversation?.title}</h3>
      </div>
      <div className="flex flex-col gap-y-4 py-4 px-6 flex-1 overflow-y-scroll">
        <AnimatePresence initial={false}>
          {conversation?.messages.map((msg) => {
            return <Message message={msg} key={msg.id} />;
          })}
        </AnimatePresence>
      </div>
      <MessageInput conversationId={id} />
    </AnimatedRoute>
  );
}
