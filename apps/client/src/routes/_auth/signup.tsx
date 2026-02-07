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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-1  gap-6 items-center">
      <Card className="w-1/2 mx-auto">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-2xl font-semibold mx-auto">Create an account</CardTitle>
          <CardDescription className="text-sm">
            Create a new account
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

            <form.Field
              name="confirmPassword"
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
                    placeholder="Confirm Password"
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

            <Button className="h-10 text-sm font-medium">Sign Up</Button>

            <div className="relative flex items-center py-2">
              <div className="grow border-t border-border" />
              <span className="mx-3 text-xs text-muted-foreground">
                or continue with
              </span>
              <div className="grow border-t border-border" />
            </div>

            <Button type="button" variant="outline" className="h-10 text-sm">
              <SiGoogle />
              Sign up with Google
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-accent hover:underline">
                Login
              </Link>
            </p>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
