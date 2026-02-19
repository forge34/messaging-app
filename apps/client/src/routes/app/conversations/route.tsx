import { DirectMessageList } from "@/components/direct-message-list";
import { getCurrentUserConversations } from "@/lib/queries/conversations";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  useParams,
} from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";

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
  const { id } = useParams({ strict: false });

  const conversations = data?.data;

  return (
    <div className="bg-card/80 w-full h-screen grid grid-cols-6">
      <DirectMessageList conversations={conversations} />
      <div className="col-span-4 min-h-0 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {id ? (
            <Outlet />
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center text-muted-foreground"
            >
              Select a conversation
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
