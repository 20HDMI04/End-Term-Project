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
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'Title of the book',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'ID of the author',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiProperty({
    description: 'Google Book ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  googleBookId?: string;

  @ApiProperty({
    description: 'Open Library ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  openLibraryId?: string;

  @ApiProperty({
    description: 'Original publisher of the book',
    required: false,
  })
  @IsOptional()
  @IsString()
  originalPublisher?: string;

  @ApiProperty({
    description: 'Original publication year',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  originalPublicationYear?: number;

  @ApiProperty({
    description: 'Latest publication year',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  latestPublicationYear?: number;

  @ApiProperty({
    description: 'Page number of the book',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageNumber?: number;

  @ApiProperty({
    description: 'Description of the book',
    required: true,
    minLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  description: string;

  @ApiProperty({
    description: 'List of ISBNs associated with the book',
    required: true,
    type: [String],
  })
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

  @ApiProperty({
    description: 'List of genre names associated with the book',
    required: true,
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',').map((v) => v.trim());
    return value;
  })
  genreNames: string[];
}
