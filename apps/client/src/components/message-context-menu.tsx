import type { PublicMessageSchema } from "@chat/shared";
import {
  Bookmark,
  BookmarkCheck,
  Info,
  Pencil,
  Reply,
  Smile,
  Trash2,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { socket } from "@/lib/sockets";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "./ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface MessageContextMenuProps {
  message: PublicMessageSchema;
  children: ReactNode;
  onReply?: (message: PublicMessageSchema) => void;
  onInfo: () => void;
  onReact: () => void;
}

export function MessageContextMenu({
  message,
  children,
  onReply,
  onInfo,
  onReact,
}: MessageContextMenuProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleDelete = () => {
    if (!message.conversationId) return;

    socket.emit("message:delete", message.conversationId, message.id);
    toast.success("Message deleted");
  };

  const handleBookmark = () => {
    if (!message.conversationId) return;

    socket.emit("message:bookmark", message.conversationId, message.id);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild disabled={!message.id}>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onSelect={() => onReply?.(message)}>
            <Reply />
            Reply
          </ContextMenuItem>

          {message.isMine && (
            <ContextMenuItem
              variant="destructive"
              onSelect={() => setConfirmDeleteOpen(true)}
            >
              <Trash2 />
              Delete
            </ContextMenuItem>
          )}

          {message.isMine && (
            <ContextMenuItem
              onSelect={() =>
                toast.info("Editing messages isn't available yet")
              }
            >
              <Pencil />
              Edit
            </ContextMenuItem>
          )}

          <ContextMenuItem onSelect={onInfo}>
            <Info />
            Info
          </ContextMenuItem>

          <ContextMenuItem
            onSelect={() => requestAnimationFrame(() => onReact())}
          >
            <Smile />
            React
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onSelect={handleBookmark}>
            {message.isBookmarked ? <BookmarkCheck /> : <Bookmark />}
            {message.isBookmarked ? "Remove bookmark" : "Bookmark"}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the message for everyone in the conversation and
              can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
