import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUsers } from "@/lib/queries/user";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";

export const Route = createFileRoute("/app/conversations/me")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    const data = await queryClient.ensureQueryData(getUsers());
    return data;
  },
});

function RouteComponent() {
  const { data } = useQuery(getUsers());
  const navigate = useNavigate();

  const users = data?.data;
  return (
    <div className="flex flex-col py-4 px-6 gap-6">
      <Input
        className="bg-background rounded-md"
        icon={<Search className="h-4 w-4" />}
        placeholder="Find people"
      />

      <div className="flex flex-row flex-wrap gap-4">
        {users?.map((u) => {
          if (u.isCurrent) return null;

          return (
            <div className="flex flex-col items-center py-2 px-4 gap-4  rounded-md bg-input/70">
              <Avatar className="h-28 w-28">
                <AvatarImage src={u?.imgUrl} />
                <AvatarFallback className="text-3xl">
                  {u?.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-2xl">{u.name}</h3>
              <Button
                onClick={() => {
                  if (u.hasConversation) {
                    navigate({
                      to: "/app/conversations/$conversationId",
                      params: { conversationId: u.mutualConversation },
                    });
                  }
                }}
              >
                {u.hasConversation ? "Open conversation" : "Start conversation"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
