import { useNavigate } from "react-router-dom";
import styles from "../styles/chat-card.module.css";

import { formatDistanceToNow } from "date-fns";
import { useActiveLink } from "../utils/hooks/use-active-link";
import { MessageSchema } from "../utils/schema";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../utils/queries";

interface ChatCardProps {
  title: string;
  lastMsg: MessageSchema;
  lastSent: string;
  conversationId: string;
  imgUrl: string;
}

export default function ChatCard({
  lastMsg,
  imgUrl,
  lastSent,
  title,
  conversationId,
}: ChatCardProps) {
  const navigate = useNavigate();
  const { selected } = useActiveLink({ link: conversationId });
  const { data: user } = useQuery(getCurrentUser());

  const addYou = lastMsg.author.id === user!.id ? "you : " : "";
  return (
    <div
      className={`${styles.chatCard}`}
      data-selected={!!selected}
      onClick={() => {
        navigate(`${conversationId}`);
      }}
    >
      <img width={48} height={48} src={imgUrl} alt="user avatar" />
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
