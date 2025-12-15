import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateArtistDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  grammy?: boolean;
}
