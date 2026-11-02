import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import {
  type PublicStickerSchema,
  type UploadKind,
  type UploadSignatureResponse,
} from '@chat/shared';

const STICKER_TAG = 'sticker';
const IMAGE_FOLDER = 'chat/images';
const STICKER_FOLDER = 'chat/stickers';
const ALLOWED_FORMATS = 'png,jpg,jpeg,webp,gif';
const STICKERS_CACHE_TTL_MS = 5 * 60 * 1000;
const STICKERS_MAX_RESULTS = 500;

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private stickerCache: {
    data: PublicStickerSchema[];
    expiresAt: number;
  } | null = null;

  createUploadSignature(kind: UploadKind): UploadSignatureResponse {
    const config = this.requireConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const params: Record<string, string> = {
      allowed_formats: ALLOWED_FORMATS,
      folder: kind === 'STICKER' ? STICKER_FOLDER : IMAGE_FOLDER,
      timestamp: String(timestamp),
    };

    if (kind === 'STICKER') {
      params.tags = STICKER_TAG;
    }

    return {
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      resourceType: 'image',
      params,
      signature: cloudinary.utils.api_sign_request(params, config.apiSecret),
    };
  }

  async listStickers(): Promise<PublicStickerSchema[]> {
    const now = Date.now();
    if (this.stickerCache && this.stickerCache.expiresAt > now) {
      return this.stickerCache.data;
    }

    const config = this.requireConfig();
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    });

    try {
      const result = await cloudinary.api.resources_by_tag(STICKER_TAG, {
        resource_type: 'image',
        max_results: STICKERS_MAX_RESULTS,
      });

      const data = result.resources.map((resource) => ({
        publicId: resource.public_id,
        url: resource.secure_url,
        format: resource.format,
        width: resource.width ?? null,
        height: resource.height ?? null,
        bytes: resource.bytes ?? null,
      }));

      this.stickerCache = { data, expiresAt: now + STICKERS_CACHE_TTL_MS };
      return data;
    } catch (error) {
      this.logger.error(`Failed to list stickers: ${String(error)}`);
      throw new ServiceUnavailableException('Failed to load stickers');
    }
  }

  private requireConfig(): CloudinaryConfig {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException(
        'Cloudinary is not configured on the server',
      );
    }

    return { cloudName, apiKey, apiSecret };
  }
}
