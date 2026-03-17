import 'reflect-metadata';
import { S3Service } from './s3.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(),
  PutObjectCommand: vi.fn(),
  DeleteObjectsCommand: vi.fn(),
}));

describe('S3Service', () => {
  let service: S3Service;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      getOrThrow: vi.fn((key: string) => {
        const config = {
          S3_BOOK_COVERS_BUCKET_NAME: 'test-bucket',
          S3_AUTHOR_IMAGES_BUCKET_NAME: 'author-bucket',
          S3_PROFILE_PICTURES_BUCKET_NAME: 'profile-bucket',
          AWS_ACCESS_KEY_ID: 'test-access-key',
          AWS_SECRET_ACCESS_KEY: 'test-secret-key',
          S3_ENDPOINT: 'http://localhost:4566',
        };
        return config[key];
      }),
      get: vi.fn((key: string) => {
        const config = {
          AWS_DEFAULT_REGION: 'us-east-1',
        };
        return config[key];
      }),
    };

    service = new S3Service(mockConfigService as ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
