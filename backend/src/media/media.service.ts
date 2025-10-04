import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Media } from '../entities/media.entity';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async uploadMedia(
    file: Express.Multer.File,
    metadata?: { alt_text?: string; caption?: string; description?: string; tags?: string[]; folder?: string },
    userId?: string,
  ): Promise<Media> {
    // Validate file was uploaded
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file exists
    if (!fs.existsSync(file.path)) {
      throw new BadRequestException('Uploaded file not found');
    }

    try {
      // Get original image metadata
      const image = sharp(file.path);
      const imageMetadata = await image.metadata();

      // Validate it's a supported image format
      if (!imageMetadata.format) {
        throw new Error('Unsupported or invalid image format');
      }

      // Convert to WebP format
      // Generate a unique filename to avoid conflicts
      const uniqueFilename = `${Date.now()}-${Math.floor(Math.random() * 1000000000)}`;
      const webpFilename = `${uniqueFilename}.webp`;
      const webpPath = path.join('./uploads', webpFilename);

      // Convert original to WebP with quality 90
      await image
        .webp({ quality: 90 })
        .toFile(webpPath);

      // Generate WebP thumbnail with quality 85
      const thumbnailFilename = `thumb_${webpFilename}`;
      const thumbnailPath = path.join('./uploads', thumbnailFilename);

      await sharp(file.path)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(thumbnailPath);

      // Delete original file after conversion
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      // Get WebP file size
      const webpStats = fs.statSync(webpPath);

      // Create media record
      const media = this.mediaRepository.create({
        filename: webpFilename,
        original_name: file.originalname,
        url: `/static/${webpFilename}`,
        thumbnail_url: `/static/${thumbnailFilename}`,
        mime_type: 'image/webp',
        size: webpStats.size,
        width: imageMetadata.width,
        height: imageMetadata.height,
        alt_text: metadata?.alt_text,
        caption: metadata?.caption,
        description: metadata?.description,
        tags: metadata?.tags || [],
        folder: metadata?.folder || 'uncategorized',
        uploaded_by_id: userId,
      });

      return await this.mediaRepository.save(media);
    } catch (error) {
      console.error('Error processing image:', error);

      // Clean up uploaded file if it still exists
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      // Provide more specific error messages
      const errorMessage = error.message || 'Failed to process image';
      if (errorMessage.includes('unsupported') || errorMessage.includes('format')) {
        throw new BadRequestException('Unsupported image format. Please upload a valid image file (JPEG, PNG, WebP, GIF, etc.)');
      }

      throw new BadRequestException(`Failed to process image: ${errorMessage}`);
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 24,
    folder?: string,
    search?: string,
    tags?: string[],
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.mediaRepository.createQueryBuilder('media');

    if (folder && folder !== 'all') {
      queryBuilder.andWhere('media.folder = :folder', { folder });
    }

    if (search) {
      queryBuilder.andWhere(
        '(media.original_name ILIKE :search OR media.alt_text ILIKE :search OR media.caption ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('media.tags && :tags', { tags });
    }

    const [items, total] = await queryBuilder
      .orderBy('media.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return media;
  }

  async update(
    id: string,
    updateData: { alt_text?: string; caption?: string; description?: string; tags?: string[]; folder?: string },
  ): Promise<Media> {
    const media = await this.findOne(id);
    Object.assign(media, updateData);
    return await this.mediaRepository.save(media);
  }

  async delete(id: string): Promise<void> {
    const media = await this.findOne(id);

    // Delete physical files
    const fullPath = path.join('.', media.url);
    const thumbnailPath = path.join('.', media.thumbnail_url);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    await this.mediaRepository.remove(media);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.delete(id);
    }
  }

  async moveToFolder(ids: string[], folder: string): Promise<void> {
    await this.mediaRepository.update(
      { id: In(ids) },
      { folder }
    );
  }

  async getFolders(): Promise<string[]> {
    const result = await this.mediaRepository
      .createQueryBuilder('media')
      .select('DISTINCT media.folder', 'folder')
      .where('media.folder IS NOT NULL')
      .getRawMany();

    return result.map(r => r.folder).filter(Boolean);
  }

  async cropImage(id: string, x: number, y: number, width: number, height: number): Promise<Media> {
    const media = await this.findOne(id);
    const fullPath = path.join('.', media.url);

    const croppedFilename = `cropped_${Date.now()}_${media.filename}`;
    const croppedPath = path.join('./uploads', croppedFilename);

    await sharp(fullPath)
      .extract({ left: x, top: y, width, height })
      .webp({ quality: 90 })
      .toFile(croppedPath);

    const croppedStats = fs.statSync(croppedPath);
    const imageMetadata = await sharp(croppedPath).metadata();

    const croppedMedia = this.mediaRepository.create({
      filename: croppedFilename,
      original_name: `cropped_${media.original_name}`,
      url: `/static/${croppedFilename}`,
      thumbnail_url: media.thumbnail_url,
      mime_type: 'image/webp',
      size: croppedStats.size,
      width: imageMetadata.width,
      height: imageMetadata.height,
      alt_text: media.alt_text,
      caption: media.caption,
      description: media.description,
      tags: media.tags,
      folder: media.folder,
      uploaded_by_id: media.uploaded_by_id,
    });

    return await this.mediaRepository.save(croppedMedia);
  }

  async resizeImage(id: string, width: number, height: number): Promise<Media> {
    const media = await this.findOne(id);
    const fullPath = path.join('.', media.url);

    const resizedFilename = `resized_${Date.now()}_${media.filename}`;
    const resizedPath = path.join('./uploads', resizedFilename);

    await sharp(fullPath)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(resizedPath);

    const resizedStats = fs.statSync(resizedPath);
    const imageMetadata = await sharp(resizedPath).metadata();

    const resizedMedia = this.mediaRepository.create({
      filename: resizedFilename,
      original_name: `resized_${media.original_name}`,
      url: `/static/${resizedFilename}`,
      thumbnail_url: media.thumbnail_url,
      mime_type: 'image/webp',
      size: resizedStats.size,
      width: imageMetadata.width,
      height: imageMetadata.height,
      alt_text: media.alt_text,
      caption: media.caption,
      description: media.description,
      tags: media.tags,
      folder: media.folder,
      uploaded_by_id: media.uploaded_by_id,
    });

    return await this.mediaRepository.save(resizedMedia);
  }
}
