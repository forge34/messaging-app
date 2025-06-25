import { useNavigate } from "react-router-dom";
import styles from "../styles/chat-card.module.css";

import { formatDistanceToNow } from "date-fns";
import { useActiveLink } from "../hooks/use-active-link";
import { MessageSchema, UserSchema } from "../utils/schema";

interface ChatCardProps {
  title: string;
  lastMsg: MessageSchema;
  lastSent: string;
  conversationId: string;
  imgUrl: string;
  user: UserSchema;
  isOnline:boolean
}

export default function ChatCard({
  lastMsg,
  imgUrl,
  lastSent,
  title,
  conversationId,
  user,
  isOnline
}: ChatCardProps) {
  const navigate = useNavigate();
  const { selected } = useActiveLink({ link: conversationId });
  const addYou = lastMsg.author.id === user.id ? "you : " : "";
  return (
    <div
      className={`${styles.chatCard}`}
      data-selected={!!selected}
      onClick={() => {
        navigate(`${conversationId}`);
      }}
    >
      <img  src={imgUrl} alt="user avatar" />
      { isOnline && <span></span> }
      <div className={styles.cardInfo}>
        <h3>{title}</h3>
        <p className={styles.lastMsg}>
          {addYou + lastMsg?.body.substring?.(0, 30)}
        </p>
      </div>
      <p className={styles.msgTime}>{formatDistanceToNow(lastSent)}</p>
    </div>
  );
}
