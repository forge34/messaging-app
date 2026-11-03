import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import cookieParser from 'cookie-parser';
import { JwtService } from '@nestjs/jwt';
import type {
  PublicStickerSchema,
  UploadSignatureResponse,
} from '@chat/shared';
import { UploadsService } from '../src/uploads/uploads.service';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import type { User } from '@chat/db/client';

interface ApiEnvelope {
  code: number;
  data?: unknown;
}

function assertBody(
  res: { statusCode: number; body: unknown },
  assert: (body: ApiEnvelope) => void,
) {
  // supertest responses are loosely typed; narrow once and assert everywhere.
  const body = res.body as ApiEnvelope;
  expect(body.code).toBe(res.statusCode);
  assert(body);
}

describe('UploadsController (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let prisma: PrismaService;
  let user: User;
  let jwtCookie: string;

  beforeAll(async () => {
    process.env.SECRET ||= 'e2e-jwt-secret';
    process.env.CLOUDINARY_CLOUD_NAME ||= 'e2e-test-cloud';
    process.env.CLOUDINARY_API_KEY ||= 'e2e-test-key';
    process.env.CLOUDINARY_API_SECRET ||= 'e2e-test-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    jwtService = app.get(JwtService);
    prisma = app.get(PrismaService);

    user = await prisma.user.create({
      data: {
        name: `e2e-uploads-${Date.now()}`,
        password: 'test-password',
        imgUrl: 'https://example.com/avatar.png',
      },
    });

    const token = await jwtService.signAsync({ ...user });
    jwtCookie = `jwt=${token}`;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { pk: user.pk } });
    await app.close();
  });

  it('rejects unauthenticated requests', () => {
    return request(app.getHttpServer())
      .post('/uploads/sign')
      .send({ kind: 'IMAGE', fileType: 'image/png', sizeBytes: 1000 })
      .expect(401);
  });

  it('rejects unsupported mime types', () => {
    return request(app.getHttpServer())
      .post('/uploads/sign')
      .set('Cookie', jwtCookie)
      .send({ kind: 'IMAGE', fileType: 'text/plain', sizeBytes: 1000 })
      .expect(400);
  });

  it('rejects oversized files', () => {
    return request(app.getHttpServer())
      .post('/uploads/sign')
      .set('Cookie', jwtCookie)
      .send({
        kind: 'IMAGE',
        fileType: 'image/png',
        sizeBytes: 10 * 1024 * 1024 + 1,
      })
      .expect(400);
  });

  it('rejects stickers above the sticker size limit', () => {
    return request(app.getHttpServer())
      .post('/uploads/sign')
      .set('Cookie', jwtCookie)
      .send({
        kind: 'STICKER',
        fileType: 'image/png',
        sizeBytes: 5 * 1024 * 1024 + 1,
      })
      .expect(400);
  });

  it('returns a signed upload payload for images', () => {
    return request(app.getHttpServer())
      .post('/uploads/sign')
      .set('Cookie', jwtCookie)
      .send({ kind: 'IMAGE', fileType: 'image/png', sizeBytes: 1000 })
      .expect(200)
      .expect((res) => {
        assertBody(res, (body) => {
          const data = body.data as UploadSignatureResponse;
          expect(typeof data.cloudName).toBe('string');
          expect(typeof data.apiKey).toBe('string');
          expect(data.resourceType).toBe('image');
          expect(typeof data.signature).toBe('string');
          expect(data.params.folder).toBe('chat/images');
          expect(data.params.allowed_formats).toBe('png,jpg,jpeg,webp,gif');
          expect(typeof data.params.timestamp).toBe('string');
          expect(data.params.tags).toBeUndefined();
        });
      });
  });

  it('returns a signed sticker upload payload tagged for listing', () => {
    return request(app.getHttpServer())
      .post('/uploads/sign')
      .set('Cookie', jwtCookie)
      .send({ kind: 'STICKER', fileType: 'image/png', sizeBytes: 1000 })
      .expect(200)
      .expect((res) => {
        assertBody(res, (body) => {
          const data = body.data as UploadSignatureResponse;
          expect(data.params.folder).toBe('chat/stickers');
          expect(data.params.tags).toBe('sticker');
        });
      });
  });

  it('returns stickers from a stubbed service', async () => {
    const stickers: PublicStickerSchema[] = [
      {
        publicId: 'chat/stickers/example',
        url: 'https://res.example/example.png',
        format: 'png',
        width: 512,
        height: 512,
        bytes: 2048,
      },
    ];
    const stub = {
      listStickers: () => Promise.resolve(stickers),
    } as Partial<UploadsService>;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UploadsService)
      .useValue(stub)
      .compile();

    const stubbedApp: INestApplication<App> =
      moduleFixture.createNestApplication();
    stubbedApp.use(cookieParser());
    await stubbedApp.init();

    await request(stubbedApp.getHttpServer())
      .get('/uploads/stickers')
      .set('Cookie', jwtCookie)
      .expect(200)
      .expect((res) => {
        assertBody(res, (body) => {
          expect(body.data).toEqual(stickers);
        });
      });

    await stubbedApp.close();
  });
});
