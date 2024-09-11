import { UserSchema } from "../utils/schema";

export interface MessageProps {
  body: string;
  id: string;
  author: UserSchema;
  ownMessage: boolean;
  status?: "pending" | "sent";
}

export default function Message({
  body,
  id,
  author,
  ownMessage,
  status = "pending",
}: MessageProps) {
  const ownMessageStyle = ownMessage ? "own" : "";
  return (
    <div
      className={"message " + ownMessageStyle}
      id={id}
      key={id}
    >
      <img src={author.imgUrl} width={32} height={32} />
      <p>{body}</p>
      <img src={status === "pending" ? "" : ""} />
    </div>
  );
}
