import TextInput from "../components/text-input";
import "../styles/css/form.css";
import { z } from "zod";
import { useZorm, Zorm } from "react-zorm";
import { Link, useNavigate } from "react-router-dom";

const FormSchema = z.object({
  username: z.string().min(1, { message: "Username can not be empty" }),
  password: z
    .string()
    .min(5, { message: "Password should be at least 5 characters" }),
});

function Signin() {
  const navigate = useNavigate();
  const zodForm: Zorm<typeof FormSchema> = useZorm("signup", FormSchema, {
    async onValidSubmit(e) {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(e.target).entries());

      await fetch(`${import.meta.env.VITE_API}/login`, {
        
        method: "POST",
        mode: "cors",
        body: JSON.stringify(data),
        credentials: "include",
        headers: { "content-Type": "Application/json" },
      });

      navigate("/");
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
          type: "password",
        }}
        error={{
          errorMsg: zodForm.errors.password()?.message,
        }}
      ></TextInput>
      <button type="submit" className="btn-submit">
        Sign in
      </button>
      <p>
        Don't have an account?{" "}
        <Link style={{ fontWeight: 600 }} to="/signup">
          Create one
        </Link>
      </p>
    </form>
  );
}

export default Signin;
