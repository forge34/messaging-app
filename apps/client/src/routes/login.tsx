import { createFileRoute } from "@tanstack/react-router";
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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background gap-6 py-16 px-24 items-center">
      <Card className="">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-2xl font-semibold">Login</CardTitle>
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
          <CardContent className="flex flex-col gap-5 px-6 pb-6">
            <form.Field
              name="username"
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <Input
                    name={field.name}
                    value={field.state.value}
                    autoComplete="off"
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    placeholder="Username"
                    className="h-12"
                  />
                  {!field.state.meta.isValid && (
                    <em className="text-xs text-destructive">
                      {field.state.meta.errors[0]?.message}
                    </em>
                  )}
                </div>
              )}
            />

            <form.Field
              name="password"
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <Input
                    type="password"
                    name={field.name}
                    value={field.state.value}
                    autoComplete="off"
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    placeholder="Password"
                    className="h-12"
                  />
                  {!field.state.meta.isValid && (
                    <em className="text-xs text-destructive">
                      {field.state.meta.errors[0]?.message}
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

            <Button className="h-10 text-sm font-medium">Login</Button>

            <div className="relative flex items-center py-2">
              <div className="grow border-t border-border" />
              <span className="mx-3 text-xs text-muted-foreground">
                or continue with
              </span>
              <div className="grow border-t border-border" />
            </div>

            <Button type="button" variant="outline" className="h-10 text-sm">
              <SiGoogle />
              Sign in with Google
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Don’t have an account?{" "}
              <button className="text-accent hover:underline">Sign up</button>
            </p>
          </CardContent>
        </form>
      </Card>
      <div className="hidden md:flex flex-col justify-center items-center p-10 relative overflow-hidden">
        <div className="w-full max-w-md">
          <div className="relative h-96 flex items-center justify-center">
            <div className="absolute w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute w-52 h-52 bg-accent/20 rounded-full blur-2xl" />

            <div className="relative z-10 space-y-4 w-full">
              <div className="ml-auto w-48 bg-primary text-primary-foreground p-4 rounded-3xl rounded-tr-md shadow-lg">
                <p className="text-sm">Hey! How are you?</p>
              </div>

              <div className="w-48 bg-secondary text-foreground p-4 rounded-3xl rounded-tl-md shadow-md">
                <p className="text-sm">Great! Ready to chat?</p>
              </div>

              <div className="ml-auto w-56 bg-primary text-primary-foreground p-4 rounded-3xl rounded-tr-md shadow-lg">
                <p className="text-sm">
                  Let’s build something amazing together
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
              <p className="text-sm font-medium text-foreground">
                Real-time messaging
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
              <p className="text-sm font-medium text-foreground">
                Connect with anyone
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
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
