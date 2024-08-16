import "../styles/css/chat-area.css";
import ChatCard from "../components/chat-card";
import SearchInput from "../components/search-input";
import { useQuery } from "@tanstack/react-query";
import { getUserConversations } from "../utils/queries";
import { Conversation } from "../utils/schema";
import { Outlet } from "react-router-dom";

export default function Chatarea() {
  const { data } = useQuery(getUserConversations());
  return (
    <div className="chat-area">
      <div>
        <h1>Chats</h1>
        <SearchInput></SearchInput>

        {data?.map((conversation: Conversation) => {
          const lastMsg =
            conversation?.messages[conversation.messages.length - 1]?.body;

          return (
            lastMsg && (
              <ChatCard
                conversationTitle={conversation.title}
                conversationLastMsg={lastMsg}
                userImg="https://avatar.iran.liara.run/public"
                conversationId={conversation.id}
                key={conversation.id}
              ></ChatCard>
            )
          );
        })}
      </div>
      <Outlet></Outlet>
    </div>
  );
}
