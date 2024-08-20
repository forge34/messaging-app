import { useNavigate } from "react-router-dom";
import "../styles/css/user-card.css";
import { Conversation } from "../utils/schema";

interface UserCardProps {
  imgSrc: string;
  username: string;
  isRelated: boolean;
  conversation: Conversation | null;
}

export default function UserCard(props: UserCardProps) {
  const navigate = useNavigate();

  function goToConversation() {
    if (props.conversation) {
      navigate(`/conversations/${props.conversation.id}`);
    }
  }

  return (
    <div className="user-card">
      <img
        src={`https://robohash.org/${props.imgSrc}`}
        width={64}
        height={64}
      />
      <div>
        <h1 className="username">{props.username}</h1>
        <button onClick={goToConversation} className="user-card-btn">
          {props.isRelated ? "open conversation" : "start conversation"}
        </button>
      </div>
    </div>
  );
}
