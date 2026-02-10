import { Sidebar } from "@/components/sidebar";
import { getMe } from "@/lib/queries/auth";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const data = await context.queryClient.ensureQueryData(getMe());

    if (data.status === 401) {
      throw redirect({ to: "/login" });
    }
  },
});

function RouteComponent() {
  return (
    <main className="flex flex-row">
      <Sidebar />
      <Outlet/>
    </main>
  );
}
