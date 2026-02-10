import { MessageCircle, Users, User, Settings, LogOut } from "lucide-react";
import { NavItem } from "./nav-item";

export function Sidebar() {
  return (
    <div className="flex flex-col h-screen w-56 border-r bg-background p-4">
      <div className="flex flex-col gap-1">
        <NavItem
          to="/app/conversations"
          label="Direct Messages"
          icon={<MessageCircle className="w-5 h-5" />}
        />

        <NavItem to="." label="Channels" icon={<Users className="w-5 h-5" />} />

        <NavItem to="/app/profile" label="Profile" icon={<User className="w-5 h-5" />} />

        <NavItem
          to="."
          label="Settings"
          icon={<Settings className="w-5 h-5" />}
        />
      </div>

      <div className="mt-auto pt-4 border-t">
        <NavItem
          to="."
          label="Logout"
          icon={<LogOut className="w-5 h-5 text-red-500" />}
        />
      </div>
    </div>
  );
}
