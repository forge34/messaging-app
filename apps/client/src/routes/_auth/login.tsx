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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-1  gap-6 items-center ">
      <Card className="w-1/2 mx-auto">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-3xl font-semibold mx-auto">Welcome back!</CardTitle>
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
          <CardContent className="flex flex-col gap-4 px-6 pb-6">
            <form.Field
              name="username"
              children={(field) => (
                <div className="flex flex-col gap0.5">
                  <Input
                    name={field.name}
                    value={field.state.value}
                    autoComplete="off"
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    placeholder="Username"
                    className="h-11"
                  />
                  {!field.state.meta.isValid && (
                    <em className="text-xs text-destructive">
                      {field.state.meta.errors[1]?.message}
                    </em>
                  )}
                </div>
              )}
            />

            <form.Field
              name="password"
              children={(field) => (
                <div className="flex flex-col gap0.5">
                  <Input
                    type="password"
                    name={field.name}
                    value={field.state.value}
                    autoComplete="off"
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    placeholder="Password"
                    className="h-11"
                  />
                  {!field.state.meta.isValid && (
                    <em className="text-xs text-destructive">
                      {field.state.meta.errors[1]?.message}
                    </em>
                  )}
                </div>
              )}
            />

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground transition"
              >
                Forgot password?
              </button>
            </div>

            <Button className="h-9 text-sm font-medium">Login</Button>

            <div className="relative flex items-center py-1">
              <div className="grow border-t border-border" />
              <span className="mx-2 text-xs text-muted-foreground">
                or continue with
              </span>
              <div className="grow border-t border-border" />
            </div>

            <Button type="button" variant="outline" className="h-9 text-sm">
              <SiGoogle />
              Sign in with Google
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-accent hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
