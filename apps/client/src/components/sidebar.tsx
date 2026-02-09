import { MessageCircle, Users, User, Settings, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface NavItemProps {
  to?: string;
  label: string;
  icon: React.ReactNode;
  isButton?: boolean;
  onClick?: () => void;
}

function NavItem({ to, label, icon }: NavItemProps) {
  const baseStyles =
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted hover:text-foreground text-muted-foreground w-full";

  const content = (
    <>
      {icon}
      <span>{label}</span>
    </>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {
          <Link to={to ?? "."} className={baseStyles}>
            {content}
          </Link>
        }
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  return (
    <div className="flex flex-col h-screen w-56 border-r bg-background p-4">
      <div className="flex flex-col gap-1">
        <NavItem
          to="."
          label="Direct Messages"
          icon={<MessageCircle className="w-5 h-5" />}
        />

        <NavItem to="." label="Channels" icon={<Users className="w-5 h-5" />} />

        <NavItem to="." label="Profile" icon={<User className="w-5 h-5" />} />

        <NavItem
          to="."
          label="Settings"
          icon={<Settings className="w-5 h-5" />}
        />
      </div>

      <div className="mt-auto pt-4 border-t">
        <NavItem
          label="Logout"
          icon={<LogOut className="w-5 h-5 text-red-500" />}
        />
      </div>
    </div>
  );
}
