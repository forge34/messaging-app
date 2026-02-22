import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="min-h-screen relative z-10 bg-[url(/auth-bg.jpg)] bg-cover bg-center flex flex-col">
      <div className="absolute inset-0 bg-background/25 backdrop-blur-md -z-10" />

      <header className="w-full py-6 px-6 md:px-14">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Echo
        </h1>
      </header>

      <section className="grow flex items-center justify-center p-4 md:p-8">
        <Outlet />
      </section>
    </main>
  );
}
