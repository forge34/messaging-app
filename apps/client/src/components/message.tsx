import { cn } from "@/lib/utils";
import type { PublicMessageSchema } from "@chat/shared";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, CheckCheck, Clock, Smile, Reply } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";
import { useState, type Ref } from "react";
import { socket } from "@/lib/sockets";
import type { MessageRefMap } from "@/routes/app/conversations/$conversationId";

interface MessageProps {
  message: PublicMessageSchema;
  onReply?: (message: PublicMessageSchema) => void;
  ref: Ref<HTMLDivElement>;
  refMap: MessageRefMap;
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

export function Message({ message, onReply, ref, refMap }: MessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const onEmojiClick = (emojiData: { emoji: string }) => {
    socket.emit(
      "message:reaction",
      message.conversationId!,
      message.id,
      emojiData.emoji,
    );
  };

  const reactionsMap = message.messageReactions?.reduce(
    (acc: Record<string, number>, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    },
    {},
  );

  const parentMessage = message?.parentMessage;

  function scrollIntoView(id: string) {
    const el = refMap.get(id);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    requestAnimationFrame(() => {
      el.classList.add("highlight");

      setTimeout(() => {
        el.classList.remove("highlight");
      }, 1000);
    });
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative flex flex-row gap-2 mb-4 w-full px-4",
        message.isMine ? "flex-row-reverse" : "flex-row",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => scrollIntoView(message.id)}
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
              scrollIntoView(parentMessage.id);
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
                  {parentMessage.body}
                </p>
              </div>
            </div>
          </div>
        )}
        <div
          className={cn(
            "flex-col absolute top-0 transition-opacity duration-200 flex gap-1",
            message.isMine ? "right-full mr-2" : "left-full ml-2",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none",
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
          <div
            id={message.id}
            className={cn(
              "rounded-2xl py-2 px-4 shadow-sm",
              message.isMine
                ? "bg-primary text-primary-foreground rounded-tr-none"
                : "bg-secondary text-secondary-foreground rounded-tl-none",
            )}
          >
            <h3
              className="text-md font-semibold"
              style={{ color: getAuthorColor(message.author.name) }}
            >
              {message.author.name}
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.body}
            </p>
            <div className="text-[10px] mt-1 flex items-center gap-1 opacity-70">
              <span>{formatTime(message.createdAt.toString())}</span>
              {message.isMine && <StatusIcon status={message.status} />}
            </div>
          </div>
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
