import { Button } from "@/components/ui/button";
import { getMe } from "@/lib/queries/auth";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {} from "../../public/bg.jpg"
export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useQuery(getMe());
  const user = data?.data;

  return (
    <div className="min-h-screen bg-[url(bg.jpg)] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs"></div>

      <nav className="flex justify-between items-center px-8 py-4 relative z-10">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
          Echo
        </h1>
        {!user && (
          <Button
            className="text-xl bg-white text-black hover:brightness-90 hover:bg-white"
            size="lg"
          >
            <Link to="/login">Login</Link>
          </Button>
        )}
      </nav>

      <div className="flex flex-col items-center justify-center text-center min-h-[70vh] relative z-10 px-4">
        <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-xl mb-6 animate-fade-in">
          Amplify Your Ideas
        </h2>
        <p className="text-xl md:text-2xl text-white/90 drop-shadow-md mb-8 max-w-2xl animate-fade-in delay-200">
          Echo is the platform where your thoughts come alive. Connect, create,
          and collaborate effortlessly.
        </p>
        <Button className=" text-white text-xl px-8 py-4 ">
          <Link to={user ? "/app" : "/login"}>Get Started</Link>
        </Button>
      </div>
    </div>
  );
}
