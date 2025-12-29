import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  MinLength,
  IsArray,
  ArrayMinSize,
  IsISBN,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsUUID()
  authorId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  originalPublisher: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  originalPublicationYear: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  latestPublicationYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageNumber: number;

  @IsString()
  @MinLength(10)
  description: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one ISBN number must be provided!' })
  @IsISBN(undefined, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((isbn) => isbn.replace(/[- ]/g, '').trim())
        .filter((isbn) => isbn.length > 0);
    }
    return value;
  })
  isbns: string[];

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one genre must be provided!' })
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((name) => name.trim());
    }
    return value;
  })
  genreNames: string[];
}
