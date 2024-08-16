import { QueryClient, queryOptions } from "@tanstack/react-query";
import { Conversation, User } from "./schema";

const getConversationById = (id: string|undefined) =>
  queryOptions({
    queryKey: ["conversation", id],
    queryFn: async ():Promise<Conversation> => {
      const res = await fetch(`${import.meta.env.VITE_API}/conversation/${id}`, {
        mode: "cors",
        credentials: "include",
      });

      return res.json();
    },
  });

const getUserConversations = () =>
  queryOptions({
    queryKey: ["user-conversations"],
    queryFn: async (): Promise<Array<Conversation>> => {
      const res = await fetch(
        `${import.meta.env.VITE_API}/conversation/currentuser`,
        {
          mode: "cors",
          credentials: "include",
        },
      );

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

      if (!res.ok) {
        throw new Error("error during fetch");
      }

      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });

const userLoader = (queryClient: QueryClient) => async () => {
  const query = getUsers();

  return queryClient.ensureQueryData(query);
};
export { userLoader, getUsers, getUserConversations, conversationLoader ,getConversationById};
