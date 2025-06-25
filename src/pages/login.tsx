import TextInput from "../components/text-input";
import styles from "../styles/form.module.css";
import { z } from "zod";
import { useZorm, Zorm } from "react-zorm";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useLogin } from "../mutations/auth";

const FormSchema = z.object({
  username: z.string().min(1, { message: "Username can not be empty" }),
  password: z
    .string()
    .min(8, { message: "Password should be at least 8 characters" }),
});

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const loginFn = useLogin();

  const zodForm: Zorm<typeof FormSchema> = useZorm("signup", FormSchema, {
    async onValidSubmit(e) {
      e.preventDefault();

      (await loginFn).mutate({ username, password });
    },
  });

  return (
    <>
      <form className={styles.formContainer} ref={zodForm.ref}>
        <h1>Login</h1>
        <TextInput
          name={zodForm.fields.username()}
          error={{
            errorMsg: zodForm.errors.username()?.message,
          }}
          label="Username"
          value={username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setUsername(e.target.value);
          }}
        ></TextInput>
        <TextInput
          name={zodForm.fields.password()}
          label="Password"
          isPassword={true}
          error={{
            errorMsg: zodForm.errors.password()?.message,
          }}
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setPassword(e.target.value);
          }}
        ></TextInput>
        <button type="submit" className={styles.btnSubmit}>
          Sign in
        </button>
        <Link to="/forgot-password">Forgot your password?</Link>
        <p>
          Don't have an account?{" "}
          <Link style={{ fontWeight: 600 }} to="/signup">
            Create one
          </Link>
        </p>
      </form>
    </>
  );
}

export default Login;
