import { Link } from "react-router-dom";
import TextInput from "../components/text-input";
import "../styles/css/form.css";
import { z } from "zod";
import { useZorm, Zorm } from "react-zorm";

const FormSchema = z
  .object({
    username: z.string().min(1, { message: "Username can not be empty" }),
    password: z
      .string()
      .min(5, { message: "Password should be at least 5 characters" }),
    confirmpassword: z.string().min(5, "Passwords do not match"),
  })
  .refine((values) => {
    return values.password === values.confirmpassword;
  }, "Passwords do not match!");

function Signup() {
  const zodForm: Zorm<typeof FormSchema> = useZorm("signup", FormSchema, {
    onValidSubmit(e) {
      e.preventDefault();
    },
  });

  return (
    <form className="form" ref={zodForm.ref}>
      <h1>Create account</h1>
      <TextInput
        name={zodForm.fields.username()}
        error={{
          errorMsg: zodForm.errors.username()?.message,
        }}
        label="Username"
      ></TextInput>
      <TextInput
        name={zodForm.fields.password()}
        label="Password"
        password={{
          isPassword: true,
          type: "new-password",
        }}
        error={{
          errorMsg: zodForm.errors.password()?.message,
        }}
      ></TextInput>
      <TextInput
        name={zodForm.fields.confirmpassword()}
        label="Confirm Password"
        password={{
          isPassword: true,
          type: "new-password",
        }}
        error={{
          errorMsg:
            zodForm.errors()?.message ||
            zodForm.errors.confirmpassword()?.message,
        }}
      ></TextInput>
      <button type="submit" className="btn-submit">
        Create account
      </button>
      <p>
        Already have an account?{" "}
        <Link style={{ fontWeight: 600 }} to={"/signin"}>
          Sign-in
        </Link>
      </p>
    </form>
  );
}

export default Signup;
