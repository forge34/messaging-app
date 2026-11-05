import { socket } from "@/lib/sockets";
import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { Input } from "./ui/input";
import { useQuery } from "@tanstack/react-query";
import { type PublicMessageSchema } from "@chat/shared";
import { getMe } from "@/lib/queries/auth";
import { useOptimisticSend } from "@/lib/hooks/use-optimistic-send";
import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { Paperclip, Smile, SendHorizontal } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { ReplyPreview } from "./reply-preview";
import { AttachmentTray } from "./attachment-tray";
import { StickerPicker } from "./sticker-picker";
import { useUploadSticker } from "@/lib/mutations/uploads";
import { toast } from "sonner";

interface MessageInputProps {
  conversationId: string;
  parentMessage?: PublicMessageSchema;
  onClearParent?: () => void;
}

const TYPING_EMIT_INTERVAL_MS = 2000;
const TYPING_STOP_DELAY_MS = 3000;

export function MessageInput({
  conversationId,
  parentMessage,
  onClearParent,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const { data } = useQuery(getMe());
  const uploadSticker = useUploadSticker();
  const image = useImageUpload();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const stickerInputRef = useRef<HTMLInputElement>(null);
  const user = data?.data;

  const uploading = image.isUploading || uploadSticker.isPending;
  const lastTypingEmitRef = useRef(0);
  const isTypingRef = useRef(false);
  const typingStopTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!value.trim() || uploading || !user?.name) {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        clearTimeout(typingStopTimerRef.current);
        socket.emit("typing:stop", conversationId);
      }
      return;
    }

    if (Date.now() - lastTypingEmitRef.current >= TYPING_EMIT_INTERVAL_MS) {
      lastTypingEmitRef.current = Date.now();
      isTypingRef.current = true;
      socket.emit("typing", conversationId, user.name);
    }

    clearTimeout(typingStopTimerRef.current);
    typingStopTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      lastTypingEmitRef.current = 0;
      socket.emit("typing:stop", conversationId);
    }, TYPING_STOP_DELAY_MS);
  }, [value, uploading, user?.name, conversationId]);

  useEffect(
    () => () => {
      clearTimeout(typingStopTimerRef.current);
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socket.emit("typing:stop", conversationId);
      }
    },
    [conversationId],
  );

  async function handleStickerSelect(file: File | undefined) {
    if (!file) return;
    try {
      await uploadSticker.mutateAsync(file);
    } catch {
      toast.error("Failed to upload sticker");
    }
  }

  const { send } = useOptimisticSend({
    conversationId,
    author: user,
    value,
    resetValue: () => setValue(""),
    parentMessage,
    onClearParent,
  });

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    send(image.attachment ?? undefined);
  }

  const onEmojiClick = (emojiData: { emoji: string }) => {
    setValue((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="bg-background">
      <ReplyPreview parentMessage={parentMessage} onClear={onClearParent} />

      <AttachmentTray
        uploadProgress={image.uploadProgress}
        attachment={image.attachment}
        onClear={() => image.setAttachment(null)}
      />

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
            void image.selectImage(e.target.files?.[0]);
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
          disabled={uploading}
          className="hover:text-primary transition-colors disabled:opacity-50"
          aria-label="Attach image"
        >
          <Paperclip size={22} />
        </button>
        <StickerPicker
          stickerPending={uploadSticker.isPending}
          stickerInputRef={stickerInputRef}
          onPickSticker={send}
        />
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
        {(value.trim() || image.attachment) && (
          <button
            type="submit"
            disabled={uploading}
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
