import { useNavigate } from "react-router-dom";
import styles from "../styles/user-card.module.css";
import { useCreateConvertion } from "../hooks/use-create-conversation";

interface UserCardProps {
  imgSrc: string;
  username: string;
  isCurrent: boolean;
  conversationId: string | null;
  userId: string;
}

export default function UserCard(props: UserCardProps) {
  const navigate = useNavigate();
  const mutation = useCreateConvertion();

  async function goToConversation() {
    if (props.conversationId) {
      navigate(`/conversations/${props.conversationId}`);
    } else {
      mutation.mutateAsync({ otherId: props.userId });
    }
  }

  return (
    <div className={styles.userCard}>
      <img src={props.imgSrc} width={64} height={64} alt="user avatar" />
      <div>
        <h1 className="username">{props.username}</h1>
        <button onClick={goToConversation} className={styles.userCardCtn}>
          {props.conversationId ? "open conversation" : "start conversation"}
        </button>
      </div>
    </div>
  );
}
