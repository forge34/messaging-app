import { QueryClient, queryOptions } from "@tanstack/react-query";
import { Params } from "react-router-dom";
import { Conversation, User } from "./schema";

const getConversationById = (id: string | undefined) =>
  queryOptions({
    queryKey: ["conversations", id],
    queryFn: async (): Promise<Conversation> => {
      const res = await fetch(
        `${import.meta.env.VITE_API}/conversation/${id}`,
        {
          mode: "cors",
          credentials: "include",
        },
      );
      if (res.status === 401) {
        throw res;
      }

      return res.json();
    },
  });

const conversationIdLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Params<"id"> }) => {
    const query = getConversationById(params.id);

    return queryClient.ensureQueryData(query);
  };

const getUserConversations = () =>
  queryOptions({
    queryKey: ["conversations"],
    queryFn: async (): Promise<Array<Conversation>> => {
      const res = await fetch(
        `${import.meta.env.VITE_API}/conversation/currentuser`,
        {
          mode: "cors",
          credentials: "include",
        },
      );
      if (res.status === 401) {
        throw res;
      }

      return res.json();
    },
  });

const conversationLoader = (queryClient: QueryClient) => async () => {
  const query = getUserConversations();

  return queryClient.ensureQueryData(query);
};

const getUsers = () =>
  queryOptions({
    queryKey: ["users"],
    queryFn: async (): Promise<Array<User>> => {
      const res = await fetch(`${import.meta.env.VITE_API}/users`, {
        method: "get",
        mode: "cors",
        credentials: "include",
      });

      if (res.status === 401) {
        throw res;
      }

      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });

const userLoader = (queryClient: QueryClient) => async () => {
  const query = getUsers();

  return queryClient.ensureQueryData(query);
};
export {
  userLoader,
  getUsers,
  getUserConversations,
  conversationLoader,
  getConversationById,
  conversationIdLoader,
};
