import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateTrackDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  artistId: string | null;

  @IsOptional()
  @IsString()
  albumId: string | null;

  @IsInt()
  @Min(0)
  duration: number;
}
