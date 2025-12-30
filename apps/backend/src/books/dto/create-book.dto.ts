import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  IsArray,
  ArrayMinSize,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsString()
  googleBookId?: string;

  @IsOptional()
  @IsString()
  openLibraryId?: string;

  @IsOptional()
  @IsString()
  originalPublisher?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  originalPublicationYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  latestPublicationYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageNumber?: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  @Transform(({ value }) => {
    if (typeof value === 'string')
      return value.split(',').map((v) => v.replace(/[- ]/g, '').trim());
    return Array.isArray(value)
      ? value.map((v) => String(v).replace(/[- ]/g, '').trim())
      : value;
  })
  isbns: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',').map((v) => v.trim());
    return value;
  })
  genreNames: string[];
}
