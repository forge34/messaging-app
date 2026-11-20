import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { UploadsService } from './uploads.service.js';
import { v2 as cloudinary } from 'cloudinary';
import { describe, vi, beforeEach, afterEach, it, expect } from 'vitest';

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    utils: { api_sign_request: vi.fn(() => 'mocked-signature') },
    api: { resources_by_tag: vi.fn() },
  },
}));

const mockedApi = vi.mocked(cloudinary.api);
const mockedSign = vi.mocked(cloudinary.utils.api_sign_request);

const ORIGINAL_ENV = { ...process.env };

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService],
    }).compile();

    service = module.get(UploadsService);
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';

    mockedApi.resources_by_tag.mockReset();
    mockedSign.mockClear();
  });

  afterEach(() => {
    process.env.CLOUDINARY_CLOUD_NAME = ORIGINAL_ENV.CLOUDINARY_CLOUD_NAME;
    process.env.CLOUDINARY_API_KEY = ORIGINAL_ENV.CLOUDINARY_API_KEY;
    process.env.CLOUDINARY_API_SECRET = ORIGINAL_ENV.CLOUDINARY_API_SECRET;
  });

  describe('createUploadSignature', () => {
    it('throws ServiceUnavailable when Cloudinary is not configured', () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;

      expect(() => service.createUploadSignature('IMAGE')).toThrow(
        ServiceUnavailableException,
      );
    });

    it('signs image uploads into the images folder without tags', () => {
      const result = service.createUploadSignature('IMAGE');

      const [signedParams, apiSecret] = mockedSign.mock.calls[0] as unknown as [
        Record<string, string>,
        string,
      ];

      expect(apiSecret).toBe('test-secret');
      expect(signedParams.folder).toBe('chat/images');
      expect(signedParams.allowed_formats).toBe('png,jpg,jpeg,webp,gif');
      expect(typeof signedParams.timestamp).toBe('string');
      expect(signedParams.tags).toBeUndefined();

      expect(result.cloudName).toBe('test-cloud');
      expect(result.apiKey).toBe('test-key');
      expect(result.resourceType).toBe('image');
      expect(result.signature).toBe('mocked-signature');
      expect(result.params.tags).toBeUndefined();
    });

    it('signs sticker uploads into the stickers folder tagged for listing', () => {
      const result = service.createUploadSignature('STICKER');

      expect(result.params.folder).toBe('chat/stickers');
      expect(result.params.tags).toBe('sticker');

      const [signedParams] = mockedSign.mock.calls[0] as unknown as [
        Record<string, string>,
        string,
      ];

      expect(signedParams.tags).toBe('sticker');
      expect(signedParams.folder).toBe('chat/stickers');
    });
  });

  describe('listStickers', () => {
    it('maps Cloudinary resources and caches the result', async () => {
      mockedApi.resources_by_tag.mockResolvedValue({
        resources: [
          {
            public_id: 'chat/stickers/test',
            secure_url: 'https://res.example/sticker.png',
            format: 'png',
            width: 512,
            height: 512,
            bytes: 1234,
          },
        ],
      } as unknown as Awaited<
        ReturnType<typeof cloudinary.api.resources_by_tag>
      >);

      const first = await service.listStickers();
      const second = await service.listStickers();

      expect(mockedApi.resources_by_tag).toHaveBeenCalledTimes(1);
      const firstCall = mockedApi.resources_by_tag.mock.calls[0] as unknown;
      const [, options] = firstCall as [string, { resource_type?: string }];
      expect(options.resource_type).toBe('image');
      expect(first).toEqual([
        {
          publicId: 'chat/stickers/test',
          url: 'https://res.example/sticker.png',
          format: 'png',
          width: 512,
          height: 512,
          bytes: 1234,
        },
      ]);
      expect(second).toEqual(first);
    });

    it('throws ServiceUnavailable when the Cloudinary API fails', async () => {
      mockedApi.resources_by_tag.mockRejectedValue(new Error('boom'));

      await expect(service.listStickers()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
