import { useRef, useState } from "react";
import { MessageSchema } from "../utils/schema";
import styles from "../styles/message.module.css";
import MoreHorizontal from "../assets/more-horizontal.svg";
import Copy from "../assets/copy.svg";
import toast from "react-hot-toast";
import { useDropdown } from "../utils/message-dropdown-context";

export interface MessageProps {
  message: MessageSchema;
  conversationId: string;
  ownMessage: boolean;
  status?: "pending" | "sent";
}

export default function Message({
  message,
  ownMessage,
  conversationId,
  // status = "pending",
}: MessageProps) {
  const [hovering, setHovering] = useState(false);
  const context = useDropdown();
  const openDropdwon = context!.openDropdown;
  const menuRef = useRef<HTMLImageElement>(null);

  function copy() {
    navigator.clipboard.writeText(message.body);

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
      <div
        className={styles.message}
        id={message.id}
        key={message.id}
        data-own={ownMessage}
      >
        <img
          src={message.author.imgUrl}
          width={32}
          height={32}
          alt="user avatar"
        />
        <p>{message.body}</p>
      </div>{" "}
      {hovering && (
        <div className={styles.hoverMenu}>
          <img src={Copy} width={16} height={16} onClick={copy} />
          <img
            ref={menuRef}
            src={MoreHorizontal}
            width={24}
            height={24}
            onClick={() => {
              openDropdwon(message, conversationId, {
                x: menuRef.current?.getBoundingClientRect().left ?? 0,
                y: menuRef.current?.getBoundingClientRect().top ?? 0,
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
