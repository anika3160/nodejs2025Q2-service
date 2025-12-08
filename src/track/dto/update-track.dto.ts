import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateTrackDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsString()
  artistId?: string | null;

  @IsOptional()
  @IsString()
  albumId?: string | null;

  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;
}
