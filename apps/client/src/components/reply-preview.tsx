import type { PublicMessageSchema } from "@chat/shared";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./ui/button";
import { messagePreview } from "@/lib/format";

interface ReplyPreviewProps {
  parentMessage?: PublicMessageSchema;
  onClear?: () => void;
}

export function ReplyPreview({ parentMessage, onClear }: ReplyPreviewProps) {
  return (
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
                {messagePreview(parentMessage)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 hover:bg-background/80 rounded-full"
              onClick={onClear}
            >
              <X size={16} />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
