import React from "react";
import { UserSchema } from "../utils/schema";

interface MessageProps {
  body: string;
  id: string;
  author: UserSchema;
  ownMessage: boolean;
  lastMessageRef: React.Ref<HTMLDivElement>;
  status?: "pending" | "sent";
}

export default function Message({
  body,
  id,
  author,
  ownMessage,
  lastMessageRef,
  status = "pending",
}: MessageProps) {
  const ownMessageStyle = ownMessage ? "own" : "";
  return (
    <div
      className={"message " + ownMessageStyle}
      ref={lastMessageRef}
      id={id}
      key={id}
    >
      <img src={author.imgUrl} width={32} height={32} />
      <p>{body}</p>
      <img src={status === "pending" ? "" : ""} />
    </div>
  );
}
