import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { SignupRequest } from "@chat/shared";
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
import { useSignup } from "@/lib/mutations/auth";

export const Route = createFileRoute("/_auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const mutatation = useSignup();
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: SignupRequest,
    },
    onSubmit: ({ value }) => {
      const { username, password, confirmPassword } = value;
      mutatation.mutate({ username, password, confirmPassword });
    },
  });

  return (
    <div className="w-full md:w-2/3 flex items-center justify-center p-4">
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1 pb-6 text-center">
          <CardTitle className="text-lg md:text-2xl font-bold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription className="text-sm">
            Enter your details to get started
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <CardContent className="grid gap-4 px-6 pb-8">
            <form.Field
              name="password"
              children={(field) => (
                <div className="grid gap-1.5">
                  <Input
                    type="password"
                    name={field.name}
                    value={field.state.value}
                    autoComplete="new-password"
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Password"
                    className="h-11"
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
              name="confirmPassword"
              children={(field) => (
                <div className="grid gap-1.5">
                  <Input
                    type="password"
                    name={field.name}
                    value={field.state.value}
                    autoComplete="new-password"
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Confirm Password"
                    className="h-11"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <em className="text-xs text-destructive not-italic">
                      {field.state.meta.errors[0]?.message}
                    </em>
                  )}
                </div>
              )}
            />

            <Button type="submit" className="w-full h-10 mt-2">
              Sign Up
            </Button>

            <div className="relative flex items-center py-2">
              <div className="grow border-t border-border" />
              <span className="mx-3 text-[10px] uppercase text-muted-foreground whitespace-nowrap">
                or continue with
              </span>
              <div className="grow border-t border-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 gap-2"
            >
              <SiGoogle className="h-4 w-4" />
              Sign up with Google
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-2">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                Login
              </Link>
            </p>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
