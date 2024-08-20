import { useNavigate } from "react-router-dom";
import "../styles/css/chat-card.css";
import { formatDistanceToNow } from "date-fns";
interface ChatCardProps {
  userImg: string;
  conversationTitle: string;
  conversationLastMsg: string;
  conversationLastSent?: string|Date;
  conversationId: string;
}

export default function ChatCard({
  conversationLastMsg,
  userImg,
  conversationLastSent = "Seconds ago...",
  conversationTitle,
  conversationId,
}: ChatCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="chat-card"
      onClick={() => {
        navigate(`${conversationId}`);
      }}
    >
      <img width={48} height={48} src={userImg} />
      <div className="card-info">
        <h3>{conversationTitle}</h3>
        <p className="last-msg">{conversationLastMsg}</p>
      </div>
      <p className="msg-time">{formatDistanceToNow(conversationLastSent)}</p>
    </div>
  );
}
