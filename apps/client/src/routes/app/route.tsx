import { Sidebar } from "@/components/sidebar";
import { useBreakpoint } from "@/lib/hooks/use-match-media";
import { getMe } from "@/lib/queries/auth";
import { socket } from "@/lib/sockets";
import {
  onMessageConfirm,
  onMessageCreate,
  onMessageRead,
  onMesssageReaction,
} from "@/lib/sockets/handlers";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const data = await context.queryClient.ensureQueryData(getMe());

    if (data?.status === 401) {
      throw redirect({ to: "/login" });
    }
  },
});

function RouteComponent() {
  const { isSuccess } = useQuery(getMe());
  const { md } = useBreakpoint();
  useEffect(() => {
    if (isSuccess) {
      if (!socket.connected) {
        socket.connect();
      }
    }

    return () => {
      socket.disconnect();
    };
  }, [isSuccess]);

  useEffect(() => {
    socket.on("message:create", onMessageCreate);
    socket.on("message:create:confirm", onMessageConfirm);
    socket.on("message:read", onMessageRead);
    socket.on("message:reaction", onMesssageReaction);

    return () => {
      socket.off("message:create", onMessageCreate);
      socket.off("message:create:confirm", onMessageConfirm);
      socket.off("message:read", onMessageRead);
      socket.off("message:reaction", onMesssageReaction);
    };
  });

  return (
    <main className="flex flex-row w-full h-screen">
      <Sidebar />
      <div className={`flex-1 ${!md ? "pt-16" : ""}`}>
        <Outlet />
      </div>
    </main>
  );
}
