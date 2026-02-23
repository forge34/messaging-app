import { cn } from "@/lib/utils";
import type { PublicMessageSchema } from "@chat/shared";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, CheckCheck, Clock } from "lucide-react";

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
          className={cn(
            "rounded-md py-2 px-4 max-w-fit flex flex-col gap-1",
            message.isMine ? "bg-primary ml-auto" : "bg-secondary",
          )}
        >
          <p>{message.body}</p>

          <div
            className={cn(
              "text-xs flex items-center gap-1",
              message.isMine ? "justify-end" : "justify-start",
            )}
          >
            <span>{formatTime(message.createdAt.toString())}</span>

            {message.isMine && <StatusIcon status={message.status} />}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
