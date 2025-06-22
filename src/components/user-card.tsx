import { useNavigate } from "react-router-dom";
import { ConversationSchema } from "../utils/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../router";
import styles from "../styles/user-card.module.css"

interface UserCardProps {
  imgSrc: string;
  username: string;
  isCurrent: boolean;
  conversationId: string | null;
  userId: string;
}

export default function UserCard(props: UserCardProps) {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: async ({ otherId }: { otherId: string }) => {
      const res = await fetch(`${import.meta.env.VITE_API}/conversation`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: JSON.stringify({ otherId: otherId }),
        headers: { "content-Type": "Application/json" },
      });

      if (res.status === 401) {
        navigate("/login");
      }

      return res.json();
    },
    onSuccess: async ({
      conversation,
    }: {
      conversation: ConversationSchema;
    }) => {
      await queryClient.invalidateQueries();
      navigate(`/conversations/${conversation.id}`);
    },
  });

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
          {props.conversationId  ? "open conversation" : "start conversation"}
        </button>
      </div>
    </div>
  );
}
