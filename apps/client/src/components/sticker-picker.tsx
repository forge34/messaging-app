import { useQuery } from "@tanstack/react-query";
import { Plus, LoaderCircle, Sticker } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";
import { getStickers } from "@/lib/queries/stickers";
import {
  stickerToAttachment,
  type AttachmentMeta,
} from "@/lib/mutations/uploads";
import type { RefObject } from "react";

interface StickerPickerProps {
  stickerPending: boolean;
  stickerInputRef: RefObject<HTMLInputElement | null>;
  onPickSticker: (attachmentMeta: AttachmentMeta) => void;
}

export function StickerPicker({
  stickerPending,
  stickerInputRef,
  onPickSticker,
}: StickerPickerProps) {
  const stickers = useQuery(getStickers());

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={stickerPending}
          className="hover:text-primary transition-colors disabled:opacity-50"
          aria-label="Open sticker picker"
        >
          <Sticker size={22} className="mx-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-fit p-2">
        <div className="max-h-72 max-w-xs overflow-y-auto grid grid-cols-4 gap-1.5">
          {stickers.data?.data?.length ? (
            stickers.data.data.map((sticker) => (
              <button
                type="button"
                key={sticker.publicId}
                onClick={() => onPickSticker(stickerToAttachment(sticker))}
                className="rounded-md p-1 hover:bg-muted transition-colors"
              >
                <img
                  src={sticker.url}
                  alt={`Sticker ${sticker.format}`}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                  loading="lazy"
                />
              </button>
            ))
          ) : (
            <p className="col-span-4 p-2 text-xs text-muted-foreground">
              {stickers.isPending ? "Loading stickers..." : "No stickers yet"}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="my-2 w-full"
          disabled={stickerPending}
          onClick={() => stickerInputRef.current?.click()}
        >
          {stickerPending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          {stickerPending ? "Uploading sticker..." : "Add stickers"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
