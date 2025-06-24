import toast from "react-hot-toast";
import { queryClient } from "../router";
import infoIcon from "../assets/info.svg";
import { MessageSchema } from "./schema";

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
