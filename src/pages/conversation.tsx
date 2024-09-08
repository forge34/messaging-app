import { useQuery } from "@tanstack/react-query";
import { useLoaderData, useParams } from "react-router-dom";
import { getConversationById, getCurrentUser } from "../utils/queries";
import videoUcon from "../assets/video.svg";
import callIcon from "../assets/phone.svg";
import send from "../assets/send.svg";
import { FormEvent, useEffect, useRef, useState } from "react";
// import { queryClient } from "../router";
import { MessageSchema } from "../utils/schema";
import { last } from "../utils/functions";
import type { ConversationSchema, UserSchema } from "../utils/schema";
import Message from "../components/message";
import { socket } from "../utils/socket";
import cuid2 from "@paralleldrive/cuid2";
import { queryClient } from "../router";

export interface sentMessages
  extends Pick<MessageSchema, "author" | "body" | "id"> {
  status?: "pending" | "sent";
  lastMessageRef?: React.Ref<HTMLDivElement>;
  ownMessage?: boolean;
}

export default function Conversation() {
  const { id = "" } = useParams();
  const [value, setValue] = useState("");
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const initialData = useLoaderData() as ConversationSchema;
  const { data } = useQuery({ ...getConversationById(id), initialData });
  const { data: user } = useQuery(getCurrentUser());

  useEffect(() => {
    const LastMessage = document.getElementById(
      last<MessageSchema>(data.messages)?.id,
    );
    LastMessage?.scrollIntoView?.();
  }, [data.messages]);

  async function handelSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const content = formData.get("content") as string;
    const definedUser = user as unknown as UserSchema;
    const message: MessageSchema = {
      id: cuid2.createId(),
      body: content,
      author: definedUser,
      createdAt: new Date(),
      authorId: definedUser.id,
      conversationId: id,
      Conversation: data,
      ownMessage: true,
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
    <div className="conversation-box">
      <div className="top-bar">
        <h1>{data?.title}</h1>
        <img src={videoUcon} width={40} height={40} />
        <img src={callIcon} width={40} height={40} />
      </div>
      <div className="message-container">
        {data?.messages.map((message: MessageSchema) => {
          return (
            <Message
              lastMessageRef={lastMessageRef}
              author={message.author}
              body={message.body}
              id={message.id}
              ownMessage={message.ownMessage}
              key={message.id}
            ></Message>
          );
        })}
      </div>
      <div className="message-input-container">
        <form onSubmit={handelSubmit}>
          <input type="submit" hidden />
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            name="content"
            className="message-input"
            type="text"
            placeholder="Enter message ..."
            autoComplete="off"
          />
        </form>
        <img src={send} width={32} height={32} />
      </div>
    </div>
  );
}
