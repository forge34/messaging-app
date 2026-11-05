import { Spinner } from "@/components/ui/spinner";
import { LandingPage } from "@/components/landing-page";

import { getMe } from "@/lib/queries/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    await context.queryClient.ensureQueryData(getMe());
  },
  pendingComponent: () => (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Spinner className="size-20" />
    </div>
  ),
});

function RouteComponent() {
  return <LandingPage />;
}
