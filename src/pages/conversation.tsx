import { useMutation, useQuery } from "@tanstack/react-query";
import { useLoaderData, useParams } from "react-router-dom";
import { getConversationById } from "../utils/queries";
import videoUcon from "../assets/video.svg";
import callIcon from "../assets/phone.svg";
import send from "../assets/send.svg";
import { FormEvent, useEffect, useRef, useState } from "react";
import { queryClient } from "../router";
import { Message } from "../utils/schema";
import { last } from "../utils/functions";
import type { Conversation } from "../utils/schema";

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
  function handelSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    mutation.mutate({ id, content: formData.get("content") });
    setValue("");
  }
  const initialData = useLoaderData() as Conversation;
  const { data } = useQuery({ ...getConversationById(id), initialData });

  useEffect(() => {
    const LastMessage = document.getElementById(
      last<Message>(data.messages).id,
    );
    LastMessage?.scrollIntoView?.();
  }, [data.messages]);

  return (
    <div className="conversation-box">
      <div className="top-bar">
        <h1>{data?.title}</h1>
        <img src={videoUcon} width={40} height={40} />
        <img src={callIcon} width={40} height={40} />
      </div>
      <div className="message-container">
        {data?.messages.map((message: Message) => {
          const ownMessageStyle = message.ownMessage ? "own" : "";
          return (
            <div
              className={"message " + ownMessageStyle}
              ref={lastMessageRef}
              id={message.id}
              key={message.id}
            >
              <img src={message.author.imgUrl} width={32} height={32} />
              <p>{message.body}</p>
            </div>
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
