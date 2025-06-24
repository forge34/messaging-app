import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getConversationById, getCurrentUser } from "../utils/queries";
import { useEffect } from "react";
import { MessageSchema } from "../utils/schema";
import { last } from "../utils/functions";
import Message from "../components/message";
import closeBtnPath from "../assets/close-btn.svg";
import styles from "../styles/conversation.module.css";
import MessageInput from "../components/message-input";

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
