import { socket } from "@/lib/sockets";
import { useEffect, useState, type FormEvent } from "react";
import { Input } from "./ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Routes, type PublicMessageSchema } from "@chat/shared";
import { getMe } from "@/lib/queries/auth";
import z from "zod";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Smile, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Button } from "./ui/button";
import { AnimatePresence, motion } from "motion/react";

interface MessageInputProps {
  conversationId: string;
  parentMessage?: PublicMessageSchema;
  onClearParent?: () => void;
}

export function MessageInput({
  conversationId,
  parentMessage,
  onClearParent,
}: MessageInputProps) {
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
  }, [debouncedValue, user?.name, conversationId]);

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
      ...(parentMessage && { parentMessageId: parentMessage.id }),
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
    const parentMessageId = parentMessage ? parentMessage.id : undefined;
    socket.emit(
      "message:create",
      message,
      conversationId,
      tempId,
      parentMessageId,
    );
    setValue("");
    onClearParent?.();
  }

  const onEmojiClick = (emojiData: { emoji: string }) => {
    setValue((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="bg-background">
      <AnimatePresence initial={false}>
        {parentMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-6 py-3 border-t border-border bg-muted/50 backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-1 self-stretch bg-primary rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={parentMessage.author.imgUrl}
                    className="rounded-full w-4 h-4"
                    alt={parentMessage.author.name}
                  />
                  <span className="text-xs font-semibold text-foreground">
                    {parentMessage.author.name}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {parentMessage.body}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 hover:bg-background/80 rounded-full"
                onClick={onClearParent}
              >
                <X size={16} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form
        className="flex flex-row py-2 px-6 mb-2"
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
          placeholder={parentMessage ? "Reply to message..." : "Send a message"}
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
    </div>
  );
}
