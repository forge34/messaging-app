import { useNavigate } from "react-router-dom";
import "../styles/css/chat-card.css";

interface ChatCardProps {
  userImg: string;
  conversationTitle: string;
  conversationLastMsg: string;
  conversationLastSent?: string;
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
        <p>{conversationLastMsg}</p>
      </div>
      <h5>{conversationLastSent}</h5>
    </div>
  );
}
