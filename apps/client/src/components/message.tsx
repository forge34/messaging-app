import { cn } from "@/lib/utils";
import type { PublicMessageSchema } from "@chat/shared";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

interface MessageProps {
  message: PublicMessageSchema;
}

const formatTime = (date: string) => {
  const now = new Date(date);
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export function Message({ message }: MessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to="."
        hash={message.id}
        className="flex flex-row gap-2 cursor-default"
      >
        <img
          src={message.author.imgUrl}
          className={cn(
            "rounded-full w-10 h-10 self-center",
            message.isMine ? "order-2" : "",
          )}
        />
        <div
          id={message.id}
          key={message.id}
          className={cn(
            "rounded-md py-2 px-4 max-w-fit ",
            message.isMine ? "bg-primary ml-auto" : "bg-secondary",
          )}
        >
          <p>{message.body}</p>
          <span
            className={cn("text-xs ", message.isMine ? "ml-auto" : "mr-auto")}
          >
            {formatTime(message.createdAt.toString())}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
