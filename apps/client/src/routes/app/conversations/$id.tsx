import { GetConversationById } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";

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
  return (
    <div className="w-full flex flex-col px">
      <div className="flex flex-row py-2 px-4 border-b items-center">
        <X
          className="h-6 w-6 mr-2"
          onClick={() => {
            navigate({ to: "/app/conversations" });
          }}
        />
        <h3 className="text-xl font-semibold">{conversation?.title}</h3>
      </div>
      <div className="flex flex-col h-full gap-y-4 py-4 px-6 justify-end">
        {conversation?.messages.map((msg) => {
          return (
            <div
              className={cn(
                "rounded-md py-2 px-6 max-w-fit",
                msg.isMine ? "bg-primary ml-auto" : "bg-secondary",
              )}
            >
              <p>{msg.body}</p>
              <span className={ cn( "text-xs ", msg.isMine ? "ml-auto":"mr-auto" ) } >{formatTime(msg.createdAt.toString())}</span>
            </div>
          );
        })}
      </div>
      <input
        className="bg-background py-2 px-6 mb-2"
        placeholder="Send a message"
      />
    </div>
  );
}
