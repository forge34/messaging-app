import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { LoginRequest } from "@chat/shared";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { useLogin } from "@/lib/mutations/auth";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const mutation = useLogin();
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onChange: LoginRequest,
    },
    onSubmit: ({ value }) => {
      mutation.mutate({ username: value.username, password: value.password });
    },
  });

  return (
    <div className="w-full md:w-2/3 flex items-center justify-center p-4">
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1 pb-6 text-center">
          <CardTitle className="text-lg md:text-2xl font-bold tracking-tight">
            Welcome back!
          </CardTitle>
          <CardDescription className="text-sm">
            Login to your account
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <CardContent className="grid gap-4">
            <form.Field
              name="username"
              children={(field) => (
                <div className="grid gap-2">
                  <Input
                    name={field.name}
                    value={field.state.value}
                    autoComplete="username"
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Username"
                    className="h-10"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <em className="text-xs text-destructive not-italic">
                      {field.state.meta.errors[0]?.message}
                    </em>
                  )}
                </div>
              )}
            />

            <form.Field
              name="password"
              children={(field) => (
                <div className="grid gap-2">
                  <Input
                    type="password"
                    name={field.name}
                    value={field.state.value}
                    autoComplete="current-password"
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Password"
                    className="h-10"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <em className="text-xs text-destructive not-italic">
                      {field.state.meta.errors[0]?.message}
                    </em>
                  )}
                </div>
              )}
            />

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-10"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Logging in..." : "Login"}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 gap-2"
            >
              <SiGoogle className="h-4 w-4" />
              Google
            </Button>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                Don’t have an account?{" "}
              </span>
              <Link
                to="/signup"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
