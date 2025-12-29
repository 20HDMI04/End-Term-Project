import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { randomBytes } from 'crypto';
import { UploadedFile } from 'src/common/interceptors/fastify-file.interceptor';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly buckets: Record<string, string>;

  constructor(private configService: ConfigService) {
    this.buckets = {
      book: this.configService.getOrThrow<string>('S3_BOOK_COVERS_BUCKET_NAME'),
      author: this.configService.getOrThrow<string>(
        'S3_AUTHOR_IMAGES_BUCKET_NAME',
      ),
      profile: this.configService.getOrThrow<string>(
        'S3_PROFILE_PICTURES_BUCKET_NAME',
      ),
    };

    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_DEFAULT_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
      endpoint: this.configService.getOrThrow<string>('S3_ENDPOINT'),
      forcePathStyle: true,
    });
  }

  /**
   * Delete images from S3
   * @param bucket The bucket type ('author' | 'book' | 'profile')
   * @param fileKeys File keys to delete
   */
  async deleteImages(
    bucket: 'author' | 'book' | 'profile',
    fileKeys: string[],
  ) {
    if (!fileKeys || fileKeys.length === 0) return;

    if (fileKeys.length > 10) {
      throw new BadRequestException(
        'Too many file keys for a single deletion.',
      );
    }

    const command = new DeleteObjectsCommand({
      Bucket: this.buckets[bucket],
      Delete: {
        Objects: fileKeys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error(`S3 delete error (${bucket}):`, error);
      throw new InternalServerErrorException(
        `An error occurred while deleting images from ${bucket} bucket.`,
      );
    }
  }

  /**
   * Sharp for image processing and upload to S3
   * @param file Multer file object
   * @param bucket bucket type ('author' | 'book' | 'profile')
   * @param title Image name base for generating file names
   */
  async uploadImage(
    file: UploadedFile,
    bucket: 'author' | 'book' | 'profile',
    title: string,
  ) {
    const sizes = this.getSizesForBucket(bucket);
    const currentBucket = this.buckets[bucket];

    const safeTitle = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase();

    const uploadPromises = sizes.map(async (size) => {
      const hash = randomBytes(4).toString('hex');
      const fileName = `${safeTitle}-${size.name}-${hash}.webp`;

      const webpBuffer = await sharp(file.buffer)
        .resize({
          height: size.height,
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: currentBucket,
          Key: fileName,
          Body: webpBuffer,
          ContentType: 'image/webp',
          ACL: 'public-read',
        }),
      );

      const publicUrl = `${this.configService.get('S3_ENDPOINT')}/${currentBucket}/${fileName}`;

      return { name: size.name, url: publicUrl, key: fileName };
    });

    try {
      const results = await Promise.all(uploadPromises);

      return {
        small: results.find((r) => r.name === 'small')!.url,
        large: results.find((r) => r.name === 'large')!.url,
        keys: results.map((r) => r.key),
      };
    } catch (error) {
      console.error(`S3 upload error (${bucket}):`, error);
      throw new InternalServerErrorException(
        `Failed to process or upload ${bucket} images.`,
      );
    }
  }

  private getSizesForBucket(
    bucket: string,
  ): { name: string; height: number }[] {
    switch (bucket) {
      case 'author':
        return [
          { name: 'small', height: 100 },
          { name: 'large', height: 400 },
        ];
      case 'book':
        return [
          { name: 'small', height: 300 },
          { name: 'large', height: 600 },
        ];
      case 'profile':
        return [
          { name: 'small', height: 150 },
          { name: 'large', height: 300 },
        ];
      default:
        throw new BadRequestException('Invalid bucket type.');
    }
  }
}
