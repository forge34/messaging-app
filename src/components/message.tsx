import { useState } from "react";
import { UserSchema } from "../utils/schema";
import styles from "../styles/message.module.css";
import MoreHorizontal from "../assets/more-horizontal.svg";

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
  // status = "pending",
}: MessageProps) {
  const [hovering, setHovering] = useState(false);
  return (
    <div
      style={{ paddingTop: "0.25em" }}
      onMouseOver={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className={styles.message} id={id} key={id} data-own={ownMessage}>
        <img src={author.imgUrl} width={32} height={32} alt="user avatar" />
        <p>{body}</p>
        {hovering && <img src={MoreHorizontal} width={24} height={24} />}
      </div>
    </div>
  );
}
