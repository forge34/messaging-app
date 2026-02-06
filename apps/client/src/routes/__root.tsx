import { Outlet, createRootRoute } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { getMe } from "@/lib/queries/auth";

export const Route = createRootRoute({
  component: RootComponent,
  beforeLoad: async ({ context }) => {
    const data = await context.queryClient.ensureQueryData(getMe());
    console.log(data);
  },
});

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Toaster position="top-center" />
      <Outlet />
    </ThemeProvider>
  );
}
