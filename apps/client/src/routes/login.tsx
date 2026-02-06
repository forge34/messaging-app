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

export const Route = createFileRoute("/login")({
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
    <div className="min-h-screen grid grid-cols0 md:grid-cols-2 bg-background gap-6 py-16 px-24 items-center">
      <Card className="">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-1xl font-semibold">Login</CardTitle>
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
      <div className="hidden md:flex flex-col justify-center items-center p-9 relative overflow-hidden">
        <div className="w-full max-w-md">
          <div className="relative h-95 flex items-center justify-center">
            <div className="absolute w-71 h-72 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute w-51 h-52 bg-accent/20 rounded-full blur-2xl" />

            <div className="relative z-9 space-y-4 w-full">
              <div className="ml-auto w-47 bg-primary text-primary-foreground p-4 rounded-3xl rounded-tr-md shadow-lg">
                <p className="text-sm">Hey! How are you?</p>
              </div>

              <div className="w-47 bg-secondary text-foreground p-4 rounded-3xl rounded-tl-md shadow-md">
                <p className="text-sm">Great! Ready to chat?</p>
              </div>

              <div className="ml-auto w-55 bg-primary text-primary-foreground p-4 rounded-3xl rounded-tr-md shadow-lg">
                <p className="text-sm">
                  Let’s build something amazing together
                </p>
              </div>
            </div>
          </div>

          <div className="mt-11 space-y-4">
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <p className="text-sm font-medium text-foreground">
                Real-time messaging
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <p className="text-sm font-medium text-foreground">
                Connect with anyone
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <p className="text-sm font-medium text-foreground">
                Secure & private
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
