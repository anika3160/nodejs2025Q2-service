import { IsBoolean, IsString, MinLength } from 'class-validator';

export class CreateArtistDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsBoolean()
  grammy: boolean;
}
