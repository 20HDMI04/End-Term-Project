import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

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

    const rawBody = request.body;

    if (!rawBody || !rawBody.file) {
      throw new BadRequestException('File is required.');
    }

    request.file = {
      fieldname: rawBody.file.fieldname,
      originalname: rawBody.file.filename,
      encoding: rawBody.file.encoding,
      mimetype: rawBody.file.mimetype,
      buffer: rawBody.file._buf,
      size: rawBody.file._buf?.length || 0,
    };

    const cleanBody = {};
    for (const key in rawBody) {
      if (rawBody[key].type === 'field') {
        cleanBody[key] = rawBody[key].value;
      }
    }

    if (!this.allowedMimeTypes.includes(request.file.mimetype)) {
      throw new BadRequestException('Invalid file type.');
    }

    request.body = cleanBody;
    return next.handle();
  }
}
