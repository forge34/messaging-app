import React, { useState } from "react";

interface TextInputProps {
  name: string;
  label: string;
  password: boolean;
}

export default function TextInput(props: TextInputProps) {
  const [value, setValue] = useState("");

  return (
    <div>
      <label>{props.label}</label>
      <input
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
