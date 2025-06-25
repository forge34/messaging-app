import {
  ConversationSchema,
  UserSchema,
  MessageSchema,
  MessageStatus,
} from "../utils/schema";
import { queryClient } from "../router";
import { socket } from "../utils/socket";
import send from "../assets/send.svg";
import { FormEvent, useState } from "react";
import styles from "../styles/conversation.module.css";

function MessageInput({
  id,
  data,
  user,
}: {
  id: string;
  data: ConversationSchema;
  user: UserSchema;
}) {
  const [value, setValue] = useState("");
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const content = value.trim();
    if (!content) return;
    const tempId = `temp-${Date.now()}`;
    const message: MessageSchema = {
      id: tempId,
      body: content,
      author: user,
      createdAt: new Date().toISOString(),
      authorId: user.id,
      conversationId: id,
      Conversation: data,
      status: MessageStatus.PENDING,
    };

    queryClient.setQueryData(
      ["conversations", id],
      (old: ConversationSchema) => {
        return { ...old, messages: [...old.messages, message] };
      },
    );

    socket.emit("message:create", message, id, tempId);

    setValue("");
  }

  return (
    <form className={styles.messageInputContainer} onSubmit={handleSubmit}>
      <input type="submit" hidden />
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        name="content"
        className={styles.messageInput}
        type="text"
        placeholder="Enter message ..."
        autoComplete="off"
      />
      <input
        type="image"
        src={send}
        width={32}
        height={32}
        disabled={!value.trim()}
      />
    </form>
  );
}

export default MessageInput;
