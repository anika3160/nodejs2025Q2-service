import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsInt()
  @Min(0)
  year: number;

  @IsOptional()
  @IsString()
  artistId: string | null;
}
