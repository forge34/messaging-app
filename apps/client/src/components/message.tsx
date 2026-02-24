import { cn } from "@/lib/utils";
import type { PublicMessageSchema } from "@chat/shared";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, CheckCheck, Clock, Smile } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { useState } from "react";
import { socket } from "@/lib/sockets";

interface MessageProps {
  message: PublicMessageSchema;
}

const formatTime = (date: string) => {
  const now = new Date(date);
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
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

export function Message({ message }: MessageProps) {
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        <div
          className={cn(
            "absolute top-0 transition-opacity duration-200 flex gap-1",
            message.isMine ? "right-full mr-2" : "left-full ml-2",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-1.5 rounded-full bg-secondary hover:bg-muted text-muted-foreground shadow-sm border border-border">
                <Smile size={16} />
              </button>
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
                <span className="text-md">{emoji}</span>
                <span className="text-[10px] opacity-70">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
