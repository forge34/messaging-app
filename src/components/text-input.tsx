import React from "react";
import "../styles/text-input.css";

interface TextInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: {
    errorMsg: string | undefined;
  };
  isPassword?: boolean;
}

export default function TextInput({
  name,
  value,
  label,
  onChange,
  error,
  isPassword,
}: TextInputProps) {
  const state = error?.errorMsg ? "invalid" : "";

  return (
    <div className={"text-input"}>
      <label htmlFor={name}>{label} </label>
      <input
        aria-invalid={!!error?.errorMsg}
        className={state}
        type={isPassword ? "password" : "text"}
        value={value}
        name={name}
        onChange={onChange}
      />
      {error?.errorMsg && <span className="error">{error.errorMsg}</span>}
    </div>
  );
}
