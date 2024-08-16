import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getConversationById } from "../utils/queries";
import { Message } from "../utils/schema";
import { randomIp } from "../utils/functions";
// import send from "../assets/send.svg";

export default function Conversation() {
  const { id } = useParams();

  const { data } = useQuery(getConversationById(id));
  return (
    <div className="conversation-box">
      <h1>{data?.title}</h1>
      <div className="message-container">
        {data?.messages.map((message: Message) => {
          return (
            <div className="message" key={message.id}>
              <img
                src={`https://robohash.org/${randomIp()}`}
                width={32}
                height={32}
              />
              <p>{message.body}</p>
            </div>
          );
        })}
        <form>
          <input
            className="message-input"
            type="text"
            placeholder="Enter message ..."
          />
        </form>
      </div>
    </div>
  );
}
