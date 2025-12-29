import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { randomBytes } from 'crypto';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bookBucketName: string;
  private profileBucketName: string;
  private authorBucketName: string;

  constructor(private configService: ConfigService) {
    this.bookBucketName = this.configService.get<string>(
      'S3_BOOK_COVERS_BUCKET_NAME',
    )!;
    this.profileBucketName = this.configService.get<string>(
      'S3_AUTHOR_IMAGES_BUCKET_NAME',
    )!;
    this.authorBucketName = this.configService.get<string>(
      'S3_PROFILE_PICTURES_BUCKET_NAME',
    )!;

    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_DEFAULT_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        )!,
      },
      endpoint: this.configService.get<string>('S3_ENDPOINT')!,
    });
  }

  async deleteImage(bucket: 'author' | 'book' | 'profile', fileKeys: string[]) {
    if (fileKeys.length === 0) {
      throw new InternalServerErrorException(
        'No file keys provided for deletion.',
      );
    } else if (fileKeys.length > 2) {
      throw new InternalServerErrorException(
        'Too many file keys provided for deletion.',
      );
    }

    if (fileKeys.some((key) => !key || key.trim() === '')) {
      throw new InternalServerErrorException(
        'One or more invalid file keys provided for deletion.',
      );
    }

    const currentBucket =
      bucket === 'author'
        ? this.authorBucketName
        : bucket === 'book'
          ? this.bookBucketName
          : this.profileBucketName;

    const deletePromises = fileKeys.map(async (key) => {
      const command = new PutObjectCommand({
        Bucket: currentBucket,
        Key: key,
      });
    });

    try {
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('S3 delete error from LocalStack:', error);
      throw new InternalServerErrorException(
        `An error occurred while deleting the ${bucket} images.`,
      );
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    bucket: 'author' | 'book' | 'profile',
    title: string,
  ) {
    if (bucket !== 'author' && bucket !== 'book' && bucket !== 'profile') {
      throw new InternalServerErrorException('Invalid bucket specified.');
    }

    const sizes: { name: string; height: number }[] = [];
    if (bucket === 'author') {
      sizes.push(
        { name: 'small', height: 100 },
        { name: 'large', height: 400 },
      );
    } else if (bucket === 'book') {
      sizes.push(
        { name: 'small', height: 300 },
        { name: 'large', height: 600 },
      );
    } else if (bucket === 'profile') {
      sizes.push(
        { name: 'small', height: 150 },
        { name: 'large', height: 300 },
      );
    }

    const uploadPromises = sizes.map(async (size) => {
      const charHash = randomBytes(16).toString('hex');
      const fileName = `${title}-${size.name}-${charHash}.webp`;

      const webpBuffer = await sharp(file.buffer)
        .resize(size.height)
        .webp({ quality: 80 })
        .toBuffer();

      const currentBucket =
        bucket === 'author'
          ? this.authorBucketName
          : bucket === 'book'
            ? this.bookBucketName
            : this.profileBucketName;

      const command = new PutObjectCommand({
        Bucket: currentBucket,
        Key: fileName,
        Body: webpBuffer,
        ContentType: 'image/webp',
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      const publicUrl = `${this.configService.get('S3_ENDPOINT')}/${currentBucket}/${fileName}`;

      return { name: size.name, url: publicUrl, key: fileName };
    });

    try {
      const results = await Promise.all(uploadPromises);

      if (results.length !== 2) {
        throw new InternalServerErrorException(
          'Unexpected number of upload results.',
        );
      }

      const response = {
        small: results.find((r) => r.name === 'small')!.url,
        large: results.find((r) => r.name === 'large')!.url,
        keys: results.map((r) => {
          return r.key;
        }),
      };

      if (!response.small || !response.large) {
        throw new InternalServerErrorException(
          `Failed to upload one or more ${bucket} images.`,
        );
      }

      return response as { small: string; large: string; keys: string[] };
    } catch (error) {
      console.error('S3 upload error to LocalStack:', error);

      throw new InternalServerErrorException(
        `An error occurred while uploading/processing the ${bucket} images.`,
      );
    }
  }
}
