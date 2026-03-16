import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    description: 'It defines which page you want.',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'It defines how many books you want to get in one page.',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'It is your search query.',
    required: false,
  })
  @IsOptional()
  @Type(() => String)
  search?: string;

  @ApiProperty({
    description: 'It defines how you would like to sort.',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'booksnumber' = 'name';

  @ApiProperty({
    description: 'It defines how you sorting.',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
