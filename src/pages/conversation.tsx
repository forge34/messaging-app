import { useMutation, useQuery } from "@tanstack/react-query";
import { useLoaderData, useParams } from "react-router-dom";
import { getConversationById } from "../utils/queries";
import videoUcon from "../assets/video.svg";
import callIcon from "../assets/phone.svg";
import send from "../assets/send.svg";
import { FormEvent, useEffect, useRef, useState } from "react";
import { queryClient } from "../router";
import { MessageSchema } from "../utils/schema";
import { last } from "../utils/functions";
import type { ConversationSchema } from "../utils/schema";
import Message from "../components/message";

export default function Conversation() {
  const { id } = useParams();
  const [value, setValue] = useState("");
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const mutation = useMutation({
    mutationFn: async ({
      id,
      content,
    }: {
      id: string | undefined;
      content: FormDataEntryValue | null;
    }) => {
      return fetch(`${import.meta.env.VITE_API}/conversation/${id}`, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({ content }),
        credentials: "include",
        headers: { "content-Type": "Application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
  const initialData = useLoaderData() as ConversationSchema;
  const { data } = useQuery({ ...getConversationById(id), initialData });

  useEffect(() => {
    const LastMessage = document.getElementById(
      last<MessageSchema>(data.messages)?.id,
    );
    LastMessage?.scrollIntoView?.();
  }, [data.messages]);

  function handelSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    mutation.mutate({ id, content: formData.get("content") });
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
