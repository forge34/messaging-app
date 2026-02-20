import { DirectMessageList } from "@/components/direct-message-list";
import { getCurrentUserConversations } from "@/lib/queries/conversations";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";

export const Route = createFileRoute("/app/conversations")({
  component: RouteComponent,
  loader: async ({ context }) => {
    const data = await context.queryClient.ensureQueryData(
      getCurrentUserConversations(),
    );

    return data;
  },
});

function RouteComponent() {
  const { data } = useQuery(getCurrentUserConversations());
  const router = useRouter();
  const conversations = data?.data;

  return (
    <div className="bg-card/80 w-full h-screen grid grid-cols-6">
      <DirectMessageList conversations={conversations} />
      <div className="col-span-4 min-h-0 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <Outlet key={router.state.location.pathname} />
        </AnimatePresence>
      </div>
    </div>
  );
}
