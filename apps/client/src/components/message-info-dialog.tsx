import type { PublicMessageSchema } from "@chat/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { formatDateTime, messagePreview } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface MessageInfoDialogProps {
  message: PublicMessageSchema;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels = {
  PENDING: "Pending",
  DELIVERED: "Delivered",
  READ: "Read",
} as const;

function latestReadAt(message: PublicMessageSchema) {
  return message.messageReceipts?.reduce<Date | string | null>(
    (latest, receipt) => {
      if (!latest) return receipt.readAt;
      return new Date(receipt.readAt) > new Date(latest)
        ? receipt.readAt
        : latest;
    },
    null,
  );
}

export function MessageInfoDialog({
  message,
  open,
  onOpenChange,
}: MessageInfoDialogProps) {
  const queryClient = useQueryClient();
  const readAt = latestReadAt(message);

  useEffect(() => {
    if (!open || !message.conversationId) return;

    void queryClient.refetchQueries({
      queryKey: ["conversations", message.conversationId],
    });
  }, [open, message.conversationId, queryClient]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Message info</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {messagePreview(message) ?? "Message"}
          </DialogDescription>
        </DialogHeader>

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium">{statusLabels[message.status]}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Delivered</dt>
            <dd className="font-medium">
              {message.deliveredAt
                ? formatDateTime(message.deliveredAt)
                : "Not delivered"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Read</dt>
            <dd className="font-medium">
              {readAt ? formatDateTime(readAt) : "Not read yet"}
            </dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}
