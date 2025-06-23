import TextInput from "../components/text-input";
import styles from "../styles/form.module.css";
import { z } from "zod";
import { useZorm, Zorm } from "react-zorm";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { queryClient } from "../router";
import { useState } from "react";

const FormSchema = z.object({
  username: z.string().min(1, { message: "Username can not be empty" }),
  password: z
    .string()
    .min(8, { message: "Password should be at least 8 characters" }),
});

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const zodForm: Zorm<typeof FormSchema> = useZorm("signup", FormSchema, {
    async onValidSubmit(e) {
      e.preventDefault();

      const res = await fetch(`${import.meta.env.VITE_API}/login`, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({
          username,
          password,
        }),
        credentials: "include",
        headers: { "content-Type": "Application/json" },
      });

      if (res.status === 401) {
        const err = await res.json();
        toast.error(err.message, {
          style: {
            backgroundColor: "#313338",
            color: "white",
          },
        });
      } else {
        toast.success("Login sucess", {
          
          style: {
            backgroundColor: "#313338",
            color: "white",
          },
        });
        await queryClient.invalidateQueries({});
        navigate("/");
      }
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
