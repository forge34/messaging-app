import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getConversationById } from "../utils/queries";
import { randomIp } from "../utils/functions";
import videoUcon from "../assets/video.svg";
import callIcon from "../assets/phone.svg";
import send from "../assets/send.svg";
import { FormEvent, useState } from "react";
import { queryClient } from "../router";

export default function Conversation() {
  const { id } = useParams();
  const [value,setValue] = useState("")
  const mutation = useMutation({
    mutationFn: async ({
      id,
      content,
    }: {
      id: string | undefined;
      content: FormDataEntryValue | null;
    }) => {
      console.log(content);
      return fetch(`${import.meta.env.VITE_API}/conversation/${id}`, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({ content }),
        credentials: "include",
        headers: { "content-Type": "Application/json" },
      });
    },
    onSuccess:() => {
      queryClient.invalidateQueries({queryKey:["conversation"]})
    }
  });
  function handelSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    mutation.mutate({ id, content: formData.get("content") });
    setValue("")
  }

  const { data } = useQuery(getConversationById(id));
  console.log(data)
  return (
    <div className="conversation-box">
      <div className="top-bar">
        <h1>{data?.title}</h1>
        <img src={videoUcon} width={40} height={40} />
        <img src={callIcon} width={40} height={40} />
      </div>
      <div className="message-container">
        {data?.messages.map((message) => {
          const ownMessageStyle = message.ownMessage ? "own" : "";
          return (
            <div className={"message " + ownMessageStyle} key={message.id}>
              <img
                src={`https://robohash.org/${randomIp()}`}
                width={32}
                height={32}
              />
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
              setValue(e.target.value)
            }}
            name="content"
            className="message-input"
            type="text"
            placeholder="Enter message ..."
          />
        </form>
        <img src={send} width={32} height={32} />
      </div>
    </div>
  );
}
