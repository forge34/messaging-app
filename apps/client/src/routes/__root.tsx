import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import type { QueryClient } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnlineUsersProvider } from "@/lib/context/online-users-provider";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Toaster position="top-center" />
      <OnlineUsersProvider>
        <TooltipProvider>
          <Outlet />
        </TooltipProvider>
      </OnlineUsersProvider>
    </ThemeProvider>
  );
}
