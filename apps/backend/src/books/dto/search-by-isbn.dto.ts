import { IsString, IsNotEmpty, IsISBN } from 'class-validator';

export class SearchByIsbnDto {
  @IsString()
  @IsNotEmpty()
  @IsISBN()
  isbn: string;
}
