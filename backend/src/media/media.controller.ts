import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata?: { alt_text?: string; caption?: string; description?: string; tags?: string; folder?: string },
  ) {
    const tags = metadata?.tags ? metadata.tags.split(',').map(t => t.trim()) : undefined;
    return this.mediaService.uploadMedia(file, { ...metadata, tags });
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('folder') folder?: string,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 24;
    const tagArray = tags ? tags.split(',') : undefined;
    return this.mediaService.findAll(pageNum, limitNum, folder, search, tagArray);
  }

  @Get('folders')
  async getFolders() {
    return this.mediaService.getFolders();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: { alt_text?: string; caption?: string; description?: string; tags?: string[]; folder?: string },
  ) {
    return this.mediaService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.mediaService.delete(id);
    return { message: 'Media deleted successfully' };
  }

  @Post('bulk-delete')
  async bulkDelete(@Body() body: { ids: string[] }) {
    await this.mediaService.bulkDelete(body.ids);
    return { message: 'Media deleted successfully' };
  }

  @Post('move')
  async move(@Body() body: { ids: string[]; folder: string }) {
    await this.mediaService.moveToFolder(body.ids, body.folder);
    return { message: 'Media moved successfully' };
  }

  @Post(':id/crop')
  async crop(
    @Param('id') id: string,
    @Body() body: { x: number; y: number; width: number; height: number },
  ) {
    return this.mediaService.cropImage(id, body.x, body.y, body.width, body.height);
  }

  @Post(':id/resize')
  async resize(
    @Param('id') id: string,
    @Body() body: { width: number; height: number },
  ) {
    return this.mediaService.resizeImage(id, body.width, body.height);
  }
}
