import "../styles/css/chat-section.css";
import ChatCard from "../components/chat-card";
import SearchInput from "../components/search-input";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getUserConversations } from "../utils/queries";
import { ConversationSchema } from "../utils/schema";
import { Outlet, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { last } from "../utils/functions";
import { useMatchMedia } from "../utils/hooks/use-match-media";

function useSortedConversations(data: ConversationSchema[]) {
  const sortedConversation = useMemo(() => {
    return data?.sort((a: ConversationSchema, b: ConversationSchema) => {
      if (!last(a.messages) || !last(b.messages)) return 0;

      if (last(a.messages)?.createdAt > last(b.messages)?.createdAt) {
        return -1;
      } else if (last(a.messages)?.createdAt < last(b.messages)?.createdAt) {
        return 1;
      }

      return 0;
    });
  }, [data]);

  return sortedConversation;
}

export default function ChatSection() {
  const { data } = useSuspenseQuery(getUserConversations());
  const sortedConversation = useSortedConversations(data);
  const { matches } = useMatchMedia("(max-width: 768px)");
  const location = useLocation();
  const activeConversation = /\/conversations\/.+/.test(location.pathname);

  if (matches) {
    if (activeConversation) {
      return (
        <div className="chat-section">
          <Outlet></Outlet>
        </div>
      );
    }
  }
  return (
    <div className="chat-section">
      <div className="chat-sidebar">
        <h1>Chats</h1>
        <SearchInput></SearchInput>
        <ChatSection.SortedConversation data={sortedConversation} />
      </div>
      <Outlet></Outlet>
    </div>
  );
}

ChatSection.SortedConversation = ({ data }: { data: ConversationSchema[] }) =>
  data?.map((conversation: ConversationSchema) => {
    const lastMsg = conversation?.messages[conversation.messages.length - 1];
    return (
      <ChatCard
        conversationImg={conversation.conversationImg as string}
        conversationTitle={conversation.title}
        conversationLastMsg={lastMsg?.body}
        conversationId={conversation.id}
        key={conversation.id}
        conversationLastSent={lastMsg?.createdAt}
      ></ChatCard>
    );
  });
