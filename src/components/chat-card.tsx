import { useNavigate } from "react-router-dom";
import styles from "../styles/chat-card.module.css";

import { formatDistanceToNow } from "date-fns";
import { useActiveLink } from "../utils/hooks/use-active-link";

interface ChatCardProps {
  conversationTitle: string;
  conversationLastMsg: string;
  conversationLastSent: string;
  conversationId: string;
  conversationImg: string;
}

export default function ChatCard({
  conversationLastMsg,
  conversationImg,
  conversationLastSent ,
  conversationTitle,
  conversationId,
}: ChatCardProps) {
  const navigate = useNavigate();
  const { selected } = useActiveLink({ link: conversationId });

  return (
    <div
      className={`${styles.chatCard}`}
      data-selected={!!selected}
      onClick={() => {
        navigate(`${conversationId}`);
      }}
    >
      <img width={48} height={48} src={conversationImg} alt="user avatar" />
      <div className={styles.cardInfo}>
        <h3>{conversationTitle}</h3>
        <p className={styles.lastMsg}>
          {conversationLastMsg?.substring?.(0, 30)}
        </p>
      </div>
      <p className={styles.msgTime}>
        {formatDistanceToNow(conversationLastSent)}
      </p>
    </div>
  );
}
