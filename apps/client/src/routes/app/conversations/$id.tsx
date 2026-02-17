import { MessageInput } from "@/components/message-input";
import { GetConversationById } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/app/conversations/$id")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params: { id } }) => {
    const data = await queryClient.ensureQueryData(GetConversationById(id));

    return data;
  },
});

const formatTime = (date: string) => {
  const now = new Date(date);
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

function RouteComponent() {
  const { id } = Route.useParams();
  const { data } = useQuery(GetConversationById(id));
  const navigate = useNavigate();

  const conversation = data?.data;

  useEffect(() => {
    const lastElement =
      conversation?.messages[conversation.messages.length - 1];
    navigate({
      hash: lastElement?.id,
    });
  });

  return (
    <div className="h-full flex flex-col ">
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
        {conversation?.messages.map((msg) => {
          return (
            <Link to="." hash={msg.id} className="flex flex-row gap-2">
              <img
                src={msg.author.imgUrl}
                className={cn(
                  "rounded-full w-10 h-10 self-center",
                  msg.isMine ? "order-2" : "",
                )}
              />
              <div
                id={msg.id}
                key={msg.id}
                className={cn(
                  "rounded-md py-2 px-4 max-w-fit ",
                  msg.isMine ? "bg-primary ml-auto" : "bg-secondary",
                )}
              >
                <p>{msg.body}</p>
                <span
                  className={cn("text-xs ", msg.isMine ? "ml-auto" : "mr-auto")}
                >
                  {formatTime(msg.createdAt.toString())}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <MessageInput conversationId={id} />
    </div>
  );
}
