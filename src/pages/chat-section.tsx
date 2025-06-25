import ChatCard from "../components/chat-card";
import SearchInput from "../components/search-input";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getCurrentUser, getUserConversations } from "../utils/queries";
import { ConversationSchema } from "../utils/schema";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { last } from "../utils/functions";
import { useMatchMedia } from "../utils/hooks/use-match-media";
import styles from "../styles/chat-section.module.css";
import { filter } from "motion/react-client";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState<ConversationSchema[]>(
    [],
  );
  const activeConversation = /\/conversations\/.+/.test(location.pathname);

  useEffect(() => {
    if (searchTerm !== "") {
      const filtered = sortedConversation.filter((conversation) =>
        conversation.title.includes(searchTerm),
      );

      if (filtered.length > 0) {
        setFilteredResults(filtered);
      }
    } else if (searchTerm === "") {
      setFilteredResults([]);
    }
  }, [searchTerm, sortedConversation]);

  if (matches) {
    if (activeConversation) {
      return (
        <div className={styles.chatSection}>
          <Outlet></Outlet>
        </div>
      );
    }
  }

  const result = filter.length > 0 ? filteredResults : sortedConversation;
  return (
    <div className={styles.chatSection}>
      <div className={styles.chatSidebar}>
        <h1>Chats</h1>
        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <Conversations data={result} />
      </div>
      <Outlet />
    </div>
  );
}

function Conversations({ data }: { data: ConversationSchema[] }) {
  const { data: user } = useQuery(getCurrentUser());

  if (!user) return null;

  return data?.map((conversation: ConversationSchema) => {
    if (conversation.messages.length === 0) return null;

    const lastMsg = conversation?.messages[conversation.messages.length - 1];
    return (
      <ChatCard
        imgUrl={conversation.conversationImg as string}
        title={conversation.title}
        lastMsg={lastMsg}
        conversationId={conversation.id}
        key={conversation.id}
        lastSent={lastMsg?.createdAt}
        user={user!}
      ></ChatCard>
    );
  });
}
