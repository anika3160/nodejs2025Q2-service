import { PartialType } from '@nestjs/mapped-types';
import { CreateFavoritesDto } from './create-favorites.dto';

export class UpdateFavDto extends PartialType(CreateFavoritesDto) {}
