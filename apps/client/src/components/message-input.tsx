import { socket } from "@/lib/sockets";
import { useEffect, useState, type FormEvent } from "react";
import { Input } from "./ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Routes, type PublicMessageSchema } from "@chat/shared";
import { getMe } from "@/lib/queries/auth";
import z from "zod";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Smile } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import EmojiPicker, { Theme } from "emoji-picker-react";
interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [value, setValue] = useState("");
  const { data } = useQuery(getMe());
  const queryClient = useQueryClient();
  const debouncedValue = useDebounce(value, 1000);
  const user = data?.data;

  useEffect(() => {
    if (!value.trim() || !user?.name) return;
    socket.emit("typing", conversationId, user?.name);
    return () => {
      return;
    };
  }, [debouncedValue, user?.name, conversationId, value]);

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

  const onEmojiClick = (emojiData: { emoji: string }) => {
    setValue((prev) => prev + emojiData.emoji);
  };

  return (
    <form
      className="bg-background flex flex-row py-2 px-6 mb-2"
      onSubmit={(e) => {
        handleSubmit(e);
      }}
    >
      <input type="submit" hidden />
      <Popover>
        <PopoverTrigger asChild>
          <button className="hover:text-primary transition-colors">
            <Smile size={24} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 border-none bg-transparent shadow-none mb-2">
          <EmojiPicker theme={Theme.AUTO} onEmojiClick={onEmojiClick} />
        </PopoverContent>
      </Popover>
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
