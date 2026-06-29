import { Sidebar } from "@/components/sidebar";
import { useOnlineUsers } from "@/lib/context/online-users";
import { useBreakpoint } from "@/lib/hooks/use-match-media";
import { getMe } from "@/lib/queries/auth";
import { socket } from "@/lib/sockets";
import {
  onConversatonCreate,
  onMessageConfirm,
  onMessageCreate,
  onMessageRead,
  onMesssageReaction,
} from "@/lib/sockets/handlers";
import {
  onNotificationCreate,
  onUnreadCount,
} from "@/lib/sockets/notification-handlers";
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
  const { setOnlineUsers } = useOnlineUsers();

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
    function handlePresenceUpdate(onlineIds: string[]) {
      setOnlineUsers(onlineIds);
    }
    socket.on("message:create", onMessageCreate);
    socket.on("message:create:confirm", onMessageConfirm);
    socket.on("message:read", onMessageRead);
    socket.on("message:reaction", onMesssageReaction);
    socket.on("users:presence_update", handlePresenceUpdate);
    socket.on("conversation:create", onConversatonCreate);
    socket.on("notification:create", onNotificationCreate);
    socket.on("notification:unread_count", onUnreadCount);

    return () => {
      socket.off("message:create", onMessageCreate);
      socket.off("message:create:confirm", onMessageConfirm);
      socket.off("message:read", onMessageRead);
      socket.off("message:reaction", onMesssageReaction);
      socket.off("users:presence_update", handlePresenceUpdate);
      socket.off("conversation:create", onConversatonCreate);
      socket.off("notification:create", onNotificationCreate);
      socket.off("notification:unread_count", onUnreadCount);
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
