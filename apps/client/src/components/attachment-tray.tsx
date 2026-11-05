import { X, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./ui/button";
import type { AttachmentMeta } from "@/lib/mutations/uploads";

interface AttachmentTrayProps {
  uploadProgress: number | null;
  attachment: AttachmentMeta | null;
  onClear: () => void;
}

export function AttachmentTray({
  uploadProgress,
  attachment,
  onClear,
}: AttachmentTrayProps) {
  return (
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
                  onClick={onClear}
                >
                  <X size={14} />
                </Button>
              </div>
            )
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
