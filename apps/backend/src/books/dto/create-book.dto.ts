import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsUUID,
  MinLength,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUUID()
  authorId: string;

  @IsDateString()
  publishedDate: string;

  @IsString()
  publisher: string;

  @Type(() => Number)
  @IsInt()
  originalPublicationYear: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  hungarianPublicationYear?: number;

  @IsString()
  @MinLength(13)
  isbn13: string;

  @Type(() => Number)
  @IsInt()
  pageNumber: number;

  @IsString()
  @MinLength(10)
  description: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one genre must be selected!' })
  @IsUUID(undefined, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
    }
    return value;
  })
  genreIds: string[];
}
