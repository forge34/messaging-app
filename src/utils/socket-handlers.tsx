import toast from "react-hot-toast";
import { queryClient } from "../router";
import { ConversationSchema, MessageSchema } from "./schema";

export function onMessageCreate(message: MessageSchema) {
  toast(
    <div className="notification">
      <span>
        <h3>{message.author.name}</h3>
        <p>{message.body}</p>
      </span>
    </div>,
    {
      icon: "ⓘ",
      duration: 1500,
    },
  );
  queryClient.invalidateQueries();
}

export function onMessageConfirm(
  message: MessageSchema,
  id: string,
  tempId: string,
) {
  queryClient.setQueryData(["conversations"], (old?: ConversationSchema[]) => {
    if (!old) return [];

    return old.map((c) => {
      if (c.id !== id) return c;

      return {
        ...c,
        messages: [...c.messages, message], 
      };
    });
  });
  queryClient.setQueryData(["conversations", id], (old: ConversationSchema) => {
    console.log(old);
    if (!old.messages) return [];
    const newMessages = old.messages.map((m) =>
      m.id === tempId ? message : m,
    );
    return { ...old, messages: newMessages };
  });
}
export async function onMessageDelete(conversationId: string) {
  await queryClient.invalidateQueries({
    queryKey: ["conversations", conversationId],
  });
}
