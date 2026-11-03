import { Body, Controller, HttpCode, UseGuards } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { Route } from '../common/route.decorator';
import { Routes } from '@chat/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { type RequestBody } from '../common/helpers';

@Controller('')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Route(Routes.createUploadSignature)
  createUploadSignature(
    @Body() body: RequestBody<typeof Routes.createUploadSignature>,
  ) {
    const data = this.uploadsService.createUploadSignature(body.kind);
    return { data };
  }

  @UseGuards(JwtAuthGuard)
  @Route(Routes.listStickers)
  async listStickers() {
    const data = await this.uploadsService.listStickers();
    return { data };
  }
}
