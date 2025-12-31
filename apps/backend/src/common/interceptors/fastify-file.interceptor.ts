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

    // Clean the body to separate fields and files
    const cleanBody = {};
    if (rawBody) {
      for (const key in rawBody) {
        if (rawBody[key]?.type === 'field') {
          cleanBody[key] = rawBody[key].value;
        }
      }
    }
    request.body = cleanBody;

    // Detect file upload
    const fileData = rawBody?.file;

    // If there is no file or invalid file, set file to null
    if (
      !fileData ||
      !fileData._buf ||
      !this.allowedMimeTypes.includes(fileData.mimetype)
    ) {
      request.file = null;
    } else {
      // if valid file, construct UploadedFile object
      request.file = {
        fieldname: fileData.fieldname,
        originalname: fileData.filename,
        encoding: fileData.encoding,
        mimetype: fileData.mimetype,
        buffer: fileData._buf,
        size: fileData._buf?.length || 0,
      };
    }

    return next.handle();
  }
}
