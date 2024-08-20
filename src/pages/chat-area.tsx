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
            conversation?.messages[conversation.messages.length - 1];
      console.log(conversation.users)
          return (
            <ChatCard
              conversationTitle={conversation.title}
              conversationLastMsg={lastMsg?.body}
              userImg={conversation.users[1].imgUrl || ""}
              conversationId={conversation.id}
              key={conversation.id}
              conversationLastSent={lastMsg?.createdAt}
            ></ChatCard>
          );
        })}
      </div>
      <Outlet></Outlet>
    </div>
  );
}
