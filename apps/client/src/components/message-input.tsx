import { socket } from "@/lib/sockets";
import { useState, type FormEvent } from "react";
import { Input } from "./ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Routes, type PublicMessageSchema } from "@chat/shared";
import { getMe } from "@/lib/queries/auth";
import z from "zod";

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [value, setValue] = useState("");
  const { data } = useQuery(getMe());
  const queryClient = useQueryClient();
  const user = data?.data;
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const content = value.trim();
    if (!content) return;
    const tempId = `temp-${Date.now()}`;
    const createdAt = new Date();
    const message: Partial<PublicMessageSchema> = {
      body: content,
      clientId: tempId,
      status: "PENDING",
      author: user,
      createdAt,
      isMine: true,
    };

    queryClient.setQueryData(
      ["conversations", conversationId],
      (oldData: z.infer<typeof Routes.getConversationById.responseSchema>) => {
        if (!oldData.data) return;
        const newConversation = {
          ...oldData.data,
          messages: [...oldData.data.messages, message as PublicMessageSchema],
        };
        return {
          ...oldData,
          data: newConversation,
        };
      },
    );
    queryClient.setQueryData(
      ["conversations"],
      (
        oldData: z.infer<
          typeof Routes.getCurrentUserConversations.responseSchema
        >,
      ) => {
        const conversations = oldData.data;
        if (!conversations) return [];

        return {
          ...oldData,
          data: conversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                lastMessage: message,
                lastMessageAt: createdAt,
              };
            }
            return conv;
          }),
        };
      },
    );
    socket.emit("message:create", message, conversationId, tempId);

    setValue("");
  }
  return (
    <form
      className="bg-background py-2 px-6 mb-2"
      onSubmit={(e) => {
        handleSubmit(e);
      }}
    >
      <input type="submit" hidden />

      <Input
        placeholder="Send a message"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        name="message-input"
        type="text"
        autoComplete="off"
        className="outline-none focus:outline-none border-none focus:border-none"
      />
    </form>
  );
}
