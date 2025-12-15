import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateAlbumDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  year?: number;

  @IsOptional()
  @IsString()
  artistId?: string | null;
}
