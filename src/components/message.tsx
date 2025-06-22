import { useState } from "react";
import { UserSchema } from "../utils/schema";
import styles from "../styles/message.module.css";
import MoreHorizontal from "../assets/more-horizontal.svg";
import Copy from "../assets/copy.svg";
import toast from "react-hot-toast";

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

  function copy() {
    navigator.clipboard.writeText(body);

    toast("Copied message to clipboard", {
      style: {
        backgroundColor: "#313338",
        color: "white",
      },
    });
  }

  return (
    <div
      style={{ paddingTop: "0.5em" }}
      onMouseOver={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className={styles.message} id={id} key={id} data-own={ownMessage}>
        <img src={author.imgUrl} width={32} height={32} alt="user avatar" />
        <p>{body}</p>
      </div>{" "}
      {hovering && (
        <div className={styles.hoverMenu}>
          <img src={Copy} width={16} height={16} onClick={copy} />
          <img src={MoreHorizontal} width={24} height={24} />
        </div>
      )}
    </div>
  );
}
