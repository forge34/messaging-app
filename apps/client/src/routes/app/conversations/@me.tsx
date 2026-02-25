import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBreakpoint } from "@/lib/hooks/use-match-media";
import { useCreateConversation } from "@/lib/mutations/conversations";
import { getUsers } from "@/lib/queries/user";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/app/conversations/@me")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    const data = await queryClient.ensureQueryData(getUsers());
    return data;
  },
});

function RouteComponent() {
  const { data } = useQuery(getUsers());
  const navigate = useNavigate();
  const createConversation = useCreateConversation();
  const { md } = useBreakpoint();
  const users = data?.data;

  return (
    <div className="flex flex-col h-full">
      {!md && (
        <div className="flex items-center gap-3 py-3 px-4 border-b">
          <button
            onClick={() => {
              navigate({ to: "/app/conversations" });
            }}
            className="p-1 hover:bg-accent rounded-md transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold">Find People</h3>
        </div>
      )}

      <div className="flex flex-col py-4 px-4 md:px-6 gap-6 flex-1 overflow-y-auto">
        <Input
          className="bg-background rounded-md"
          icon={<Search className="h-4 w-4" />}
          placeholder="Find people"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users?.map((u) => {
            if (u.isCurrent) return null;
            return (
              <div
                key={u.id}
                className="flex flex-col items-center py-4 px-4 gap-4 rounded-md bg-input/70"
              >
                <Avatar className="h-20 w-20 md:h-28 md:w-28">
                  <AvatarImage src={u?.imgUrl} />
                  <AvatarFallback className="text-2xl md:text-3xl">
                    {u?.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl md:text-2xl text-center">{u.name}</h3>
                <Button
                  className="w-full"
                  onClick={async () => {
                    if (u.hasConversation && u.mutualConversation) {
                      navigate({
                        to: "/app/conversations/$conversationId",
                        params: { conversationId: u.mutualConversation },
                      });
                    } else {
                      await createConversation.mutateAsync(u.id);
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
    </div>
  );
}
