import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getConversationById, getCurrentUser } from "../utils/queries";
import videoUcon from "../assets/video.svg";
import callIcon from "../assets/phone.svg";
import send from "../assets/send.svg";
import { FormEvent, useEffect, useState } from "react";
import { MessageSchema } from "../utils/schema";
import { last } from "../utils/functions";
import type { ConversationSchema, UserSchema } from "../utils/schema";
import Message from "../components/message";
import { socket } from "../utils/socket";
import cuid2 from "@paralleldrive/cuid2";
import { queryClient } from "../router";
import closeBtnPath from "../assets/close-btn.svg";
import styles from "../styles/conversation.module.css";

export interface sentMessages
  extends Pick<MessageSchema, "author" | "body" | "id"> {
  status?: "pending" | "sent";
  lastMessageRef?: React.Ref<HTMLDivElement>;
  ownMessage?: boolean;
}

export default function Conversation() {
  const { id = "" } = useParams();
  const { data } = useSuspenseQuery(getConversationById(id));

  const { data: user } = useSuspenseQuery(getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    const LastMessage = document.getElementById(
      last<MessageSchema>(data.messages)?.id,
    );
    LastMessage?.scrollIntoView?.();
  }, [data.messages]);

  return (
    <div className={styles.conversationBox}>
      <div className={styles.topBar}>
        <input
          className={styles.closeBtn}
          type="image"
          src={closeBtnPath}
          onClick={() => {
            navigate("/conversations");
          }}
        />
        <h1>{data.users.find((u) => u.id !== user.id)?.name}</h1>
        <img src={videoUcon} width={40} height={40} />
        <img src={callIcon} width={40} height={40} />
      </div>
      <div className={styles.messageContainer}>
        {data?.messages.map((message: MessageSchema) => {
          const ownMessage = message.author.id === user.id;
          return (
            <Message
              conversationId={id}
              message={message}
              ownMessage={ownMessage}
              key={message.id}
            ></Message>
          );
        })}
      </div>
      <MessageInput id={id} data={data} user={user} />
    </div>
  );
}

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

    const message: MessageSchema = {
      id: cuid2.createId(),
      body: content,
      author: user,
      createdAt: new Date(),
      authorId: user.id,
      conversationId: id,
      Conversation: data,
    };

    queryClient.setQueryData(
      ["conversations", id],
      (old: ConversationSchema) => {
        return { ...old, messages: [...old.messages, message] };
      },
    );

    socket.emit("message:create", {
      conversationId: id,
      content,
      messageId: message.id,
    });
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
