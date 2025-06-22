import { Link, useNavigate } from "react-router-dom";
import TextInput from "../components/text-input";
import styles from "../styles/form.module.css";
import { z } from "zod";
import { useZorm, Zorm } from "react-zorm";
import { useState } from "react";

const FormSchema = z
  .object({
    username: z.string().min(1, { message: "Username can not be empty" }),
    password: z
      .string()
      .min(5, { message: "Password should be at least 5 characters" }),
    confirmPassword: z.string().min(5, "Passwords do not match"),
  })
  .refine((values) => {
    return values.password === values.confirmPassword;
  }, "Passwords do not match!");

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPasswrd] = useState("");

  const zodForm: Zorm<typeof FormSchema> = useZorm("signup", FormSchema, {
    async onValidSubmit(e) {
      e.preventDefault();

      await fetch(`${import.meta.env.VITE_API}/signup`, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({
          username,
          password,
          confirmPassword,
        }),
        credentials: "include",
        headers: { "content-Type": "Application/json" },
      });

      navigate("/login");
    },
  });

  return (
    <form className={styles.formContainer} ref={zodForm.ref}>
      <h1>Create account</h1>
      <TextInput
        value={username}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setUsername(e.target.value);
        }}
        name={zodForm.fields.username()}
        error={{
          errorMsg: zodForm.errors.username()?.message,
        }}
        label="Username"
      ></TextInput>
      <TextInput
        value={password}
        name={zodForm.fields.password()}
        label="Password"
        isPassword={true}
        error={{
          errorMsg: zodForm.errors.password()?.message,
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setPassword(e.target.value);
        }}
      ></TextInput>
      <TextInput
        value={confirmPassword}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setConfirmPasswrd(e.target.value);
        }}
        name={zodForm.fields.confirmPassword()}
        label="Confirm Password"
        isPassword={true}
        error={{
          errorMsg:
            zodForm.errors()?.message ||
            zodForm.errors.confirmPassword()?.message,
        }}
      ></TextInput>
      <button type="submit" className={styles.btnSubmit}>
        Create account
      </button>
      <p>
        Already have an account?{" "}
        <Link style={{ fontWeight: 600 }} to={"/login"}>
          Login
        </Link>
      </p>
    </form>
  );
}

export default Signup;
