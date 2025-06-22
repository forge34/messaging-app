import { QueryClient, queryOptions } from "@tanstack/react-query";
import { Params } from "react-router-dom";
import { ConversationSchema, UserSchema } from "./schema";
import { safeFetch } from "./fetch-wrapper";

const getCurrentUser = () =>
  queryOptions({
    staleTime: 60 * 1000 * 60,
    queryKey: ["user", "current"],

    queryFn: async (): Promise<UserSchema> =>
      safeFetch(`${import.meta.env.VITE_API}/users/me`),
    retry: false,
  });

const getConversationById = (id: string | undefined) =>
  queryOptions({
    queryKey: ["conversations", id],
    queryFn: async (): Promise<ConversationSchema> =>
      safeFetch(`${import.meta.env.VITE_API}/conversation/${id}`),
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
    queryFn: async (): Promise<Array<ConversationSchema>> =>
      await safeFetch(`${import.meta.env.VITE_API}/conversation/currentuser`),
  });

const conversationLoader = (queryClient: QueryClient) => async () => {
  const query = getUserConversations();

  return queryClient.ensureQueryData(query);
};

const getUsers = () =>
  queryOptions({
    queryKey: ["users"],
    queryFn: async (): Promise<Array<UserSchema>> =>
      await safeFetch(`${import.meta.env.VITE_API}/users`),
    staleTime: 1000 * 60 * 2,
  });

const userLoader = (queryClient: QueryClient) => async () => {
  const query = getUsers();

  return queryClient.ensureQueryData(query);
};

const deleteMessage = async (id: string) => {
  await safeFetch(`${import.meta.env.VITE_API}/messages/${id}`, {
    method: "delete",
  });
};
export {
  userLoader,
  getUsers,
  getUserConversations,
  conversationLoader,
  getConversationById,
  conversationIdLoader,
  getCurrentUser,
  deleteMessage,
};
