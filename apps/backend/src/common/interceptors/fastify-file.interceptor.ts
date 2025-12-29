import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class FastifyFileInterceptor implements NestInterceptor {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const file = await request.file();

    if (!file) {
      throw new BadRequestException('File is required.');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file format: ${file.mimetype}. Only JPEG, JPG, PNG, and WebP are allowed.`,
      );
    }

    const buffer = await file.toBuffer();

    request.file = {
      fieldname: file.fieldname,
      originalname: file.filename,
      mimetype: file.mimetype,
      buffer: buffer,
    };

    return next.handle();
  }
}
