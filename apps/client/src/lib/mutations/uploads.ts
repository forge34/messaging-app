import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Routes,
  IMAGE_MIME_TYPES,
  UPLOAD_SIZE_LIMITS,
  type PublicMessageAttachmentSchema,
  type PublicStickerSchema,
  type UploadKind,
  type UploadSignatureResponse,
} from "@chat/shared";
import { toast } from "sonner";
import { apiFetch } from "../fetch-wrapper";

export type AttachmentMeta = Omit<PublicMessageAttachmentSchema, "id">;

const ApiURL = import.meta.env.VITE_API_URL as string;

async function requestUploadSignature(
  kind: UploadKind,
  file: File,
): Promise<UploadSignatureResponse> {
  const res = await apiFetch(Routes.createUploadSignature, {
    body: {
      kind,
      fileType: file.type as (typeof IMAGE_MIME_TYPES)[number],
      sizeBytes: file.size,
    },
    headers: {
      credentials: "include",
    },
    params: {},
  });

  if (!res?.data) {
    throw new Error(res?.message || "Failed to get upload signature");
  }
  return res.data;
}

async function uploadToCloudinary(
  signature: UploadSignatureResponse,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<AttachmentMeta> {
  if (!ApiURL) {
    throw new Error("Configuration Error: VITE_API_URL is not defined");
  }

  const form = new FormData();
  for (const [key, value] of Object.entries(signature.params)) {
    form.append(key, value);
  }
  form.append("api_key", signature.apiKey);
  form.append("signature", signature.signature);
  form.append("file", file);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${signature.cloudName}/${signature.resourceType}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            type: "IMAGE",
            url: json.secure_url,
            publicId: json.public_id,
            format: json.format,
            width: json.width ?? null,
            height: json.height ?? null,
            bytes: json.bytes,
          });
          return;
        }
        reject(new Error(json?.error?.message ?? "Upload failed"));
      } catch {
        reject(new Error("Failed to parse Cloudinary response"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading"));
    xhr.send(form);
  });
}

export function validateFile(kind: UploadKind, file: File) {
  if (!IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])) {
    toast.error("Only images (png, jpeg, webp, gif) are supported");
    return false;
  }
  if (file.size > UPLOAD_SIZE_LIMITS[kind]) {
    toast.error(
      `${kind === "STICKER" ? "Sticker" : "Image"} must be at most ${
        UPLOAD_SIZE_LIMITS[kind] / (1024 * 1024)
      }MB`,
    );
    return false;
  }
  return true;
}

export async function uploadAttachment(
  kind: UploadKind,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<AttachmentMeta> {
  if (!validateFile(kind, file)) {
    throw new Error("invalid file");
  }
  const signature = await requestUploadSignature(kind, file);
  const meta = await uploadToCloudinary(signature, file, onProgress);
  return { ...meta, type: kind };
}

export function useUploadSticker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      return uploadAttachment("STICKER", file);
    },
    onSuccess: () => {
      toast.success("Sticker uploaded");
      void queryClient.invalidateQueries({ queryKey: ["stickers"] });
    },
    onError: (error) => {
      if (error.message !== "invalid file") {
        toast.error("Failed to upload sticker");
      }
    },
  });
}

export function stickerToAttachment(
  sticker: PublicStickerSchema,
): AttachmentMeta {
  return {
    type: "STICKER",
    url: sticker.url,
    publicId: sticker.publicId,
    format: sticker.format,
    width: sticker.width ?? null,
    height: sticker.height ?? null,
    bytes: sticker.bytes ?? null,
  };
}
