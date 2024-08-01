import React, { useState } from "react";
import "../styles/css/text-input.css";
import { Link } from "react-router-dom";

interface Password {
  isPassword: boolean;
  type: "password" | "new-password";
}

interface TextInputProps {
  name: string;
  label: string;
  error?: {
    errorMsg: string | undefined;
  };
  password?: Password;
}

export default function TextInput(props: TextInputProps) {
  const [value, setValue] = useState("");

  const state = props.error?.errorMsg ? "invalid" : "";
  return (
    <div className={"text-input"}>
      <div>
        <label>{props.label}</label>
        {props.password?.type === "password" && (
          <Link to="/forgot-password">Forgot your password?</Link>
        )}
      </div>
      <input
        className={state}
        autoComplete={props.password?.type}
        type={props.password?.isPassword ? "password" : "text"}
        value={value}
        name={props.name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
        }}
      />
      {props.error?.errorMsg && (
        <span className="error">{props.error.errorMsg}</span>
      )}
    </div>
  );
}
