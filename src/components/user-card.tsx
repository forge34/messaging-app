import { useNavigate } from "react-router-dom";
import "../styles/css/user-card.css";
import { Conversation } from "../utils/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../router";

interface UserCardProps {
  imgSrc: string;
  username: string;
  isRelated: boolean;
  conversation: Conversation | null;
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
    onSuccess: async ({  conversation } : {conversation:Conversation}) => {
      await queryClient.invalidateQueries();
      navigate(`/conversations/${conversation.id}`);
    },
  });

  async function goToConversation() {
    if (props.conversation) {
      navigate(`/conversations/${props.conversation.id}`);
    } else {
      mutation.mutateAsync({ otherId: props.userId });
    }
  }

  return (
    <div className="user-card">
      <img src={props.imgSrc} width={64} height={64} />
      <div>
        <h1 className="username">{props.username}</h1>
        <button onClick={goToConversation} className="user-card-btn">
          {props.isRelated ? "open conversation" : "start conversation"}
        </button>
      </div>
    </div>
  );
}
