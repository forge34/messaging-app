import { QueryClient, queryOptions } from "@tanstack/react-query";
import { Params } from "react-router-dom";
import { ConversationSchema, UserSchema } from "./schema";

const getCurrentUser = () =>
  queryOptions({
    staleTime: 60 * 1000 * 60,
    queryKey: ["user", "current"],
    queryFn: async (): Promise<UserSchema> => {
      const res = await fetch(`${import.meta.env.VITE_API}/users/me`, {
        mode: "cors",
        credentials: "include",
      });

      if (res.status === 401) {
        console.log("throwing");
        throw res;
      }

      return res.json();
    },
    retry(_, error: Response) {
      if (error.status === 401) {
        return false;
      }
      return true;
    },
  });

const getConversationById = (id: string | undefined) =>
  queryOptions({
    queryKey: ["conversations", id],
    queryFn: async (): Promise<ConversationSchema> => {
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
    queryFn: async (): Promise<Array<ConversationSchema>> => {
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
    queryFn: async (): Promise<Array<UserSchema>> => {
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
  getCurrentUser,
};
