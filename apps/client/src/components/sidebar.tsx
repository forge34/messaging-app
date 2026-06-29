import {
  MessageCircle,
  Users,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { NavItem } from "./nav-item";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/queries/auth";
import { Route as UserProfileRoute } from "../routes/app/users/profile.tsx";
import { useLogout } from "@/lib/mutations/auth.ts";
import { Route as MeRoute } from "../routes/app/conversations/@me.tsx";
import { useState } from "react";
import { useBreakpoint } from "@/lib/hooks/use-match-media.tsx";
import { Route as ConversationRoute } from "../routes/app/conversations/route.tsx";

export function Sidebar() {
  const { data } = useQuery(getMe());
  const logout = useLogout();
  const { md } = useBreakpoint();
  const [isOpen, setIsOpen] = useState(false);

  const user = data?.data;
  if (!user) return null;

  const closeSidebar = () => setIsOpen(false);

  const sidebarContent = (
    <div className="flex flex-col h-full w-56 border-r bg-background p-4">
      {!md && (
        <button
          onClick={closeSidebar}
          className="self-end mb-4 p-2 hover:bg-accent rounded-md"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      <div className="flex flex-col gap-1">
        <NavItem
          to={md ? MeRoute.to : ConversationRoute.to}
          label="Direct Messages"
          icon={<MessageCircle className="w-5 h-5" />}
          onClick={closeSidebar}
        />
        <NavItem
          to="."
          label="Channels"
          icon={<Users className="w-5 h-5" />}
          onClick={closeSidebar}
        />
        <NotificationBell />
        <NavItem
          to={UserProfileRoute.to}
          label="My Profile"
          icon={<User className="w-5 h-5" />}
          onClick={closeSidebar}
        />
        <NavItem
          to="."
          label="Settings"
          icon={<Settings className="w-5 h-5" />}
          onClick={closeSidebar}
        />
      </div>
      <div
        className="mt-auto pt-4 border-t"
        onClick={() => {
          logout.mutate();
          closeSidebar();
        }}
      >
        <NavItem
          to="."
          label="Logout"
          icon={<LogOut className="w-5 h-5 text-red-500" />}
        />
      </div>
    </div>
  );

  if (md) {
    return sidebarContent;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-3 left-3 z-40 p-2.5 bg-background border rounded-lg shadow-lg hover:bg-accent"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
