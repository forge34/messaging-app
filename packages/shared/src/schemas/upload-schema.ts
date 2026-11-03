import { AttachmentTypeSchema } from "@chat/db/schemas";
import z from "zod";

export const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const ImageMimeSchema = z.enum(IMAGE_MIME_TYPES);

export const AttachmentKindSchema = AttachmentTypeSchema.exclude(["VIDEO"]);

export type UploadKind = z.infer<typeof AttachmentKindSchema>;

const MB = 1024 * 1024;

export const UPLOAD_SIZE_LIMITS = {
  IMAGE: 10 * MB,
  STICKER: 5 * MB,
} as const;

export const UploadSignatureRequest = z
  .object({
    kind: AttachmentKindSchema,
    fileType: ImageMimeSchema,
    sizeBytes: z.number().int().positive().max(UPLOAD_SIZE_LIMITS.IMAGE),
  })
  .superRefine((val, ctx) => {
    if (val.sizeBytes > UPLOAD_SIZE_LIMITS[val.kind]) {
      ctx.addIssue({
        code: "custom",
        path: ["sizeBytes"],
        message: `${val.kind} must be at most ${UPLOAD_SIZE_LIMITS[val.kind] / MB}MB`,
      });
    }
  });

export type UploadSignatureRequest = z.infer<typeof UploadSignatureRequest>;

export const UploadSignatureResponse = z.object({
  cloudName: z.string().min(1),
  apiKey: z.string().min(1),
  resourceType: z.string().min(1),
  params: z.record(z.string(), z.string()),
  signature: z.string().min(1),
});

export type UploadSignatureResponse = z.infer<typeof UploadSignatureResponse>;

export const PublicStickerSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().min(1),
  format: z.string().min(1),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  bytes: z.number().int().positive().optional().nullable(),
});

export type PublicStickerSchema = z.infer<typeof PublicStickerSchema>;
