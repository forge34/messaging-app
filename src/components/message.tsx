import { useRef, useState } from "react";
import { MessageSchema, MessageStatus } from "../utils/schema";
import styles from "../styles/message.module.css";
import MoreHorizontal from "../assets/more-horizontal.svg";
import Copy from "../assets/copy.svg";
import toast from "react-hot-toast";
import { useDropdown } from "../utils/message-dropdown-context";
import { getTime } from "../utils/functions";
import doubleTick from "../assets/delivered.svg";
import pending from "../assets/pending.svg";
import { motion } from "motion/react";

export interface MessageProps {
  message: MessageSchema;
  conversationId: string;
  ownMessage: boolean;
  status: MessageStatus;
}

export default function Message({
  message,
  ownMessage,
  conversationId,
  status,
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 ,}}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{
        type: "spring",
        bounce: 0.25,
        duration: 0.5,
      }}
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
        <img src={message.author.imgUrl} alt="user avatar" />
        <p>{message.body}</p>
        <div className={styles.messageStatus}>
          <p className="timestamp">{getTime(message.createdAt)}</p>
          {ownMessage && (
            <img src={status === "PENDING" ? pending : doubleTick} />
          )}
        </div>
      </div>
      {hovering && (
        <div className={styles.hoverMenu}>
          <img src={Copy} onClick={copy} />
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
    </motion.div>
  );
}
