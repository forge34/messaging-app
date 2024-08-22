import { useLocation, useNavigate } from "react-router-dom";
import "../styles/css/chat-card.css";
import { formatDistanceToNow } from "date-fns";
interface ChatCardProps {
  conversationTitle: string;
  conversationLastMsg: string;
  conversationLastSent: Date;
  conversationId: string;
  conversationImg: string;
}

export default function ChatCard({
  conversationLastMsg,
  conversationImg,
  conversationLastSent = new Date(),
  conversationTitle,
  conversationId,
}: ChatCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const contains = location.pathname.includes(`${conversationId}`);

  const selected = contains ? "selected" : "";

  return (
    <div
      className={`chat-card ${selected}`}
      onClick={() => {
        navigate(`${conversationId}`);
      }}
    >
      <img width={48} height={48} src={conversationImg} />
      <div className="card-info">
        <h3>{conversationTitle}</h3>
        <p className="last-msg">
          {conversationLastMsg.substring(0, 30) + "..."}
        </p>
      </div>
      <p className="msg-time">{formatDistanceToNow(conversationLastSent)}</p>
    </div>
  );
}
