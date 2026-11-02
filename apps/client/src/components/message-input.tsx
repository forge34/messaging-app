import { socket } from "@/lib/sockets";
import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { Input } from "./ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Routes, type PublicMessageSchema } from "@chat/shared";
import { getMe } from "@/lib/queries/auth";
import z from "zod";
import { useDebounce } from "@/lib/hooks/use-debounce";
import {
  Paperclip,
  Smile,
  Sticker,
  X,
  LoaderCircle,
  Plus,
  SendHorizontal,
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Button } from "./ui/button";
import { AnimatePresence, motion } from "motion/react";
import { getStickers } from "@/lib/queries/stickers";
import {
  stickerToAttachment,
  uploadAttachment,
  useUploadSticker,
  type AttachmentMeta,
} from "@/lib/mutations/uploads";
import { toast } from "sonner";

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
  const [attachment, setAttachment] = useState<AttachmentMeta | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { data } = useQuery(getMe());
  const stickers = useQuery(getStickers());
  const uploadSticker = useUploadSticker();
  const queryClient = useQueryClient();
  const debouncedValue = useDebounce(value, 1000);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const stickerInputRef = useRef<HTMLInputElement>(null);
  const user = data?.data;

  const pending = isUploading || attachment !== null || uploadSticker.isPending;

  useEffect(() => {
    if (!value.trim() || pending || !user?.name) return;
    socket.emit("typing", conversationId, user?.name);
    return () => {
      return;
    };
  }, [debouncedValue, user?.name, conversationId, value, pending]);

  async function handleImageSelect(file: File | undefined) {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const meta = await uploadAttachment("IMAGE", file, (percent) =>
        setUploadProgress(percent),
      );
      setAttachment(meta);
    } catch (error) {
      if (!(error instanceof Error && error.message === "invalid file")) {
        toast.error("Failed to upload image");
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }

  async function handleStickerSelect(file: File | undefined) {
    if (!file) return;
    try {
      await uploadSticker.mutateAsync(file);
    } catch {
      toast.error("Failed to upload sticker");
    }
  }

  function buildAndSend(attachmentMeta?: AttachmentMeta) {
    const content = value.trim();
    if (!content && !attachmentMeta) return;

    const tempId = `temp-${Date.now()}`;
    const createdAt = new Date();

    const message: Partial<PublicMessageSchema> = {
      body: content,
      status: "PENDING",
      author: user,
      createdAt,
      isMine: true,
      ...(attachmentMeta && {
        attachment: { ...attachmentMeta, id: "" },
      }),
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
                lastMessage: message as PublicMessageSchema,
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
    setAttachment(null);
    onClearParent?.();
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    buildAndSend(attachment ?? undefined);
  }

  function handleStickerClick(attachmentMeta: AttachmentMeta) {
    buildAndSend(attachmentMeta);
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
                  {parentMessage.attachment
                    ? parentMessage.attachment.type === "STICKER"
                      ? "Sticker"
                      : "Photo"
                    : parentMessage.body}
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

      <AnimatePresence initial={false}>
        {(uploadProgress !== null || attachment) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-6 py-2 border-t border-border bg-muted/50 backdrop-blur-sm"
          >
            {uploadProgress !== null ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>Uploading {uploadProgress}%</span>
                <div className="flex-1 h-1 rounded-full bg-background overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              attachment && (
                <div className="flex items-center gap-2">
                  <img
                    src={attachment.url}
                    alt="Attachment preview"
                    className="h-14 w-14 rounded-md object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => setAttachment(null)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )
            )}
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
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            void handleImageSelect(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <input
          ref={stickerInputRef}
          type="file"
          accept="image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            void handleStickerSelect(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={pending}
          className="hover:text-primary transition-colors disabled:opacity-50"
          aria-label="Attach image"
        >
          <Paperclip size={22} />
        </button>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={pending}
              className="hover:text-primary transition-colors disabled:opacity-50"
              aria-label="Open sticker picker"
            >
              <Sticker size={22} className="mx-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-fit p-2">
            <div className="max-h-72 max-w-xs overflow-y-auto grid grid-cols-4 gap-1.5">
              {stickers.data?.data?.length ? (
                stickers.data.data.map((sticker) => (
                  <button
                    type="button"
                    key={sticker.publicId}
                    onClick={() =>
                      handleStickerClick(stickerToAttachment(sticker))
                    }
                    className="rounded-md p-1 hover:bg-muted transition-colors"
                  >
                    <img
                      src={sticker.url}
                      alt={`Sticker ${sticker.format}`}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-contain"
                      loading="lazy"
                    />
                  </button>
                ))
              ) : (
                <p className="col-span-4 p-2 text-xs text-muted-foreground">
                  {stickers.isPending
                    ? "Loading stickers..."
                    : "No stickers yet"}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="my-2 w-full"
              disabled={uploadSticker.isPending}
              onClick={() => stickerInputRef.current?.click()}
            >
              {uploadSticker.isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              {uploadSticker.isPending
                ? "Uploading sticker..."
                : "Add stickers"}
            </Button>
          </PopoverContent>
        </Popover>
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
        {(value.trim() || attachment) && (
          <button
            type="submit"
            disabled={pending}
            className="text-primary disabled:opacity-50 ml-1"
            aria-label="Send message"
          >
            <SendHorizontal size={24} />
          </button>
        )}
      </form>
    </div>
  );
}
