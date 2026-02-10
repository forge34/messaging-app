import * as React from "react";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface NavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string;
  icon: React.ReactNode;
}

const NavItemComponent = React.forwardRef<HTMLAnchorElement, NavItemProps>(
  ({ icon, label, ...props }, ref) => {
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
            <a ref={ref} {...props} className={baseStyles}>
              {content}
            </a>
          }
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  },
);

const CreatedLinkComponent = createLink(NavItemComponent);

export const NavItem: LinkComponent<typeof CreatedLinkComponent> = (props) => {
  return <CreatedLinkComponent preload="intent" {...props} />;
};
