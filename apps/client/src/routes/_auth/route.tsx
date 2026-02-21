import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="min-h-screen relative z-10 bg-[url(/auth-bg.jpg)] bg-cover bg-center  py-4 px-8">
      <div className="absolute inset-0 bg-background/25 backdrop-blur-md -z-10" />
      <h1 className="text-4xl font-bold   my-6 mx-14">Echo</h1>
      <Outlet />
    </main>
  );
}
