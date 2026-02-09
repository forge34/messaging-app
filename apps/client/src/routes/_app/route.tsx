import { Sidebar } from "@/components/sidebar";
import { getMe } from "@/lib/queries/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
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
    <main>
      <Sidebar />
    </main>
  );
}
