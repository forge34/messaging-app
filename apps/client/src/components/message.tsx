import { cn } from "@/lib/utils";
import type { PublicMessageSchema } from "@chat/shared";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, CheckCheck, Clock, Smile, Reply } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";
import { useMemo } from "react";
import { socket } from "@/lib/sockets";
import { scrollHighlightIntoView } from "@/lib/utils";

interface MessageProps {
  message: PublicMessageSchema;
  onReply?: (message: PublicMessageSchema) => void;
}

const formatTime = (date: string) => {
  const now = new Date(date);
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const getAuthorColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);

  return `oklch(0.8 0.15 ${hue})`;
};

const StatusIcon = ({
  status,
}: {
  status: "PENDING" | "DELIVERED" | "READ";
}) => {
  switch (status) {
    case "PENDING":
      return <Clock size={15} className="opacity-60" />;
    case "DELIVERED":
      return <Check size={15} className="opacity-70" />;
    case "READ":
      return <CheckCheck size={15} />;
    default:
      return null;
  }
};

const TimeStatus = ({
  createdAt,
  status,
  isMine,
  className,
}: {
  createdAt: Date;
  status: "PENDING" | "DELIVERED" | "READ";
  isMine: boolean;
  className?: string;
}) => (
  <div
    className={cn(
      "text-[10px] flex items-center gap-1 opacity-70",
      className,
    )}
  >
    <span>{formatTime(createdAt.toString())}</span>
    {isMine && <StatusIcon status={status} />}
  </div>
);

export function Message({ message, onReply }: MessageProps) {
  const onEmojiClick = (emojiData: { emoji: string }) => {
    socket.emit(
      "message:reaction",
      message.conversationId!,
      message.id,
      emojiData.emoji,
    );
  };

  const reactionsMap = useMemo(
    () =>
      message.messageReactions?.reduce(
        (acc: Record<string, number>, reaction) => {
          acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
          return acc;
        },
        {},
      ),
    [message.messageReactions],
  );

  const parentMessage = message?.parentMessage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative flex flex-row gap-2 mb-4 w-full px-4",
        message.isMine ? "flex-row-reverse" : "flex-row",
      )}
      onClick={() => scrollHighlightIntoView(message.id)}
      id={message.id}
    >
      <img
        src={message.author.imgUrl}
        className="rounded-full w-8 h-8 self-center my-auto mb-1 shrink-0"
        alt={message.author.name}
      />

      <div
        className={cn(
          "relative max-w-[70%]",
          message.isMine ? "items-end" : "items-start",
        )}
      >
        {parentMessage && (
          <div
            onClick={(ev) => {
              ev.stopPropagation();
              scrollHighlightIntoView(parentMessage.id);
            }}
            className={cn(
              "mb-1 rounded-xl px-3 py-2 backdrop-blur-sm",
              message.isMine ? "bg-primary/15" : "bg-secondary/40",
            )}
          >
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  "w-1 rounded-full self-stretch",
                  message.isMine ? "bg-primary" : "bg-primary/70",
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium opacity-90 truncate">
                  {parentMessage.author.name}
                </p>
                <p className="text-xs opacity-70 line-clamp-2 leading-snug">
                  {parentMessage.attachment
                    ? parentMessage.attachment.type === "STICKER"
                      ? "Sticker"
                      : "Photo"
                    : parentMessage.body}
                </p>
              </div>
            </div>
          </div>
        )}
        <div
          className={cn(
            "flex-col absolute top-0 transition-opacity duration-200 flex gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
            message.isMine ? "right-full mr-2" : "left-full ml-2",
          )}
        >
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full shadow-sm"
            onClick={() => onReply?.(message)}
          >
            <Reply size={16} />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full shadow-sm"
              >
                <Smile size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align={message.isMine ? "end" : "start"}
              className="w-auto p-0 border-none shadow-xl"
            >
              <EmojiPicker
                theme={Theme.AUTO}
                onEmojiClick={onEmojiClick}
                skinTonesDisabled
                searchDisabled
                height={350}
                width={300}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Link
          to="."
          hash={message.id}
          className="block cursor-default transition-transform active:scale-[0.98]"
        >
          {message.attachment?.type === "STICKER" ? (
            <div className="flex flex-col items-end gap-0.5">
              <img
                src={message.attachment.url}
                alt="Sticker"
                style={
                  message.attachment.width && message.attachment.height
                    ? {
                        aspectRatio: `${message.attachment.width} / ${message.attachment.height}`,
                      }
                    : undefined
                }
                className="w-28 h-auto max-h-24 sm:w-40 sm:max-h-40 object-contain"
                loading="lazy"
              />
              <TimeStatus
                createdAt={message.createdAt}
                status={message.status}
                isMine={message.isMine}
              />
            </div>
          ) : (
            <div
              className={cn(
                "rounded-2xl shadow-sm",
                message.attachment ? "p-1" : "py-2 px-4",
                message.isMine
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-secondary text-secondary-foreground rounded-tl-none",
              )}
            >
              {!message.attachment && (
                <h3
                  className="text-md font-semibold"
                  style={{ color: getAuthorColor(message.author.name) }}
                >
                  {message.author.name}
                </h3>
              )}
              {message.attachment && (
                <div className="relative w-full max-w-72 sm:max-w-[360px]">
                  <img
                    src={message.attachment.url}
                    alt="Attachment"
                    style={
                      message.attachment.width && message.attachment.height
                        ? {
                            aspectRatio: `${message.attachment.width} / ${message.attachment.height}`,
                          }
                        : undefined
                    }
                    className="block w-full h-auto max-h-[55svh] rounded-lg object-cover"
                    loading="lazy"
                  />
                  <TimeStatus
                    className="absolute bottom-1.5 right-2 rounded-full bg-black/45 px-2 py-0.5 text-white"
                    createdAt={message.createdAt}
                    status={message.status}
                    isMine={message.isMine}
                  />
                </div>
              )}
              {message.body && (
                <p
                  className={cn(
                    "text-sm leading-relaxed whitespace-pre-wrap",
                    message.attachment ? "px-2 pt-1 pb-0.5" : "mt-1",
                  )}
                >
                  {message.body}
                </p>
              )}
              {!message.attachment && (
                <TimeStatus
                  className="mt-1"
                  createdAt={message.createdAt}
                  status={message.status}
                  isMine={message.isMine}
                />
              )}
            </div>
          )}
        </Link>
        {reactionsMap && Object.keys(reactionsMap).length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-1 mt-1",
              message.isMine ? "justify-end" : "justify-start",
            )}
          >
            {Object.entries(reactionsMap).map(([emoji, count]) => (
              <div
                key={emoji}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border text-xs shadow-sm"
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-[10px] opacity-70">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
