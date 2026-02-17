import { socket } from "@/lib/sockets";
import { useState, type FormEvent } from "react";
import { Input } from "./ui/input";

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [value, setValue] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const content = value.trim();
    if (!content) return;
    const tempId = `temp-${Date.now()}`;
    const message = { body: content };
    socket.emit("message:create", message, conversationId, tempId);

    setValue("");
  }
  return (
    <form
      className="bg-background py-2 px-6 mb-2"
      onSubmit={(e) => {
        handleSubmit(e);
      }}
    >
      <input type="submit" hidden />

      <Input
        placeholder="Send a message"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        name="message-input"
        type="text"
        autoComplete="off"
        className="outline-none focus:outline-none border-none focus:border-none"
      />
    </form>
  );
}
