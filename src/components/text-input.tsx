import React, { useState } from "react";
import "../styles/css/text-input.css";

interface TextInputProps {
  name: string;
  label: string;
  password?: boolean;
}

export default function TextInput(props: TextInputProps) {
  const [value, setValue] = useState("");

  return (
    <div className="text-input">
      <label>{props.label}</label>
      <input
        autoComplete="new-password"
        type={props.password ? "password" : "text"}
        value={value}
        name={props.name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
        }}
      />
    </div>
  );
}
