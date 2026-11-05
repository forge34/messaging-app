import { useState } from "react";
import { uploadAttachment, type AttachmentMeta } from "@/lib/mutations/uploads";
import { toast } from "sonner";

export function useImageUpload() {
  const [attachment, setAttachment] = useState<AttachmentMeta | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function selectImage(file: File | undefined) {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const meta = await uploadAttachment("IMAGE", file, (percent) =>
        setUploadProgress(percent),
      );
      setAttachment(meta);
    } catch (error) {
      if (!(error instanceof Error && error.message === "invalid file")) {
        toast.error("Failed to upload image");
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }

  return { attachment, setAttachment, uploadProgress, isUploading, selectImage };
}
