import React from "react";
import styles from "../styles/text-input.module.css";

interface TextInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: {
    errorMsg: string | undefined;
  };
  isPassword?: boolean;
  isRequired?: boolean;
}

export default function TextInput({
  name,
  value,
  label,
  onChange,
  error,
  isPassword,
  isRequired = true,
}: TextInputProps) {
  const state = error?.errorMsg ? "invalid" : "";

  return (
    <div className={styles.inputContainer}>
      <label data-required={isRequired} htmlFor={name}>
        {label}{" "}
      </label>
      <input
        aria-invalid={!!error?.errorMsg}
        className={state}
        type={isPassword ? "password" : "text"}
        value={value}
        name={name}
        onChange={onChange}
        aria-required={isRequired}
      />
      {error?.errorMsg && (
        <span className={styles.inputError}>{error.errorMsg}</span>
      )}
    </div>
  );
}
