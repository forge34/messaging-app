import toast from "react-hot-toast";
import { queryClient } from "../router";
import infoIcon from "../assets/info.svg";
import { ConversationSchema, MessageSchema } from "./schema";

export function onMessageCreate(message: MessageSchema) {
  toast(
    <div className="notification">
      <img src={infoIcon} width={32} height={32} />
      <span>
        <h3>{message.author.name}</h3>
        <p>{message.body}</p>
      </span>
    </div>,
    {
      className: "notification",
      style: {
        backgroundColor: "var(--color-surface)",
      },
      duration: 1500,
    },
  );
  queryClient.invalidateQueries();
}

export function onMessageConfirm(id: string) {
  return (message: MessageSchema) => {
    console.log("confirmed");
    queryClient.setQueryData(
      ["conversations", id],
      (old: ConversationSchema) => {
        console.log(old);
        if (!old.messages) return [];
        const newMessages = old.messages.map((m) =>
          m.id === "tempId" ? message : m,
        );
        return { ...old, messages: newMessages };
      },
    );
  };
}
export async function onMessageDelete(conversationId: string) {
  await queryClient.invalidateQueries({
    queryKey: ["conversations", conversationId],
  });
}
