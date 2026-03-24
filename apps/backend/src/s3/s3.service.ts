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
import type { UploadedFile } from 'src/common/types/types';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly buckets: Record<string, string>;

  /**
   * @summary S3Service constructor
   * @description Initializes the S3Service by setting up the S3 client and bucket names based on the provided configuration. The constructor retrieves necessary configuration values such as AWS credentials, region, endpoint, and bucket names for different types of images (book covers, author images, profile pictures). If any required configuration value is missing, an error will be thrown during initialization.
   * @param configService The configuration service for retrieving S3 configuration values. Its from s3.config.ts which is a nestjs/config package and is used to access environment variables and other configuration settings required for S3 operations.
   */
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
   * @summary Delete images from S3
   * @description Deletes images from the specified S3 bucket based on the provided file keys. The method checks if the file keys are valid and limits the number of keys to prevent excessive deletions. If any error occurs during the deletion process, an InternalServerErrorException is thrown.
   * @param bucket The type of bucket from which to delete images ('author', 'book', or 'profile').
   * @param fileKeys File keys to delete
   * @throws  BadRequestException if the number of file keys exceeds the allowed limit.
   * @throws  InternalServerErrorException if an error occurs during the deletion process.
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
   * @summary Process and upload an image to S3
   * @description This method takes an uploaded file, processes it using Sharp to create different sizes based on the specified bucket type, and uploads the processed images to S3. The method generates unique file names to avoid collisions and returns the URLs and keys of the uploaded images. If any error occurs during processing or uploading, an InternalServerErrorException is thrown.
   * @param file Multer file object
   * @param bucket bucket type ('author' | 'book' | 'profile')
   * @param title Image name base for generating file names
   * @returns An object containing URLs and keys of the uploaded images
   * @throws  BadRequestException if the bucket type is invalid.
   * @throws  InternalServerErrorException if an error occurs during image processing or upload to S3.
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

  /**
   * @summary Get image sizes for a given bucket type
   * @description Returns an array of size configurations based on the specified bucket type. Each configuration includes a name and a height for resizing images. If an invalid bucket type is provided, a BadRequestException is thrown.
   * @param bucket The type of bucket for which to retrieve size configurations ('author', 'book', or 'profile').
   * @returns An array of size configurations for the specified bucket type.
   * @throws  BadRequestException if the bucket type is invalid.
   */
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
