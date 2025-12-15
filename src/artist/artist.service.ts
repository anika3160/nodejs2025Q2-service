import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ERROR_MESSAGES } from '../common/constants';
import { validateUuid } from '../common/utils/uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}

  create(createArtistDto: CreateArtistDto) {
    return this.prisma.artist.create({
      data: {
        id: randomUUID(),
        name: createArtistDto.name,
        grammy: createArtistDto.grammy,
      },
    });
  }

  findAll() {
    return this.prisma.artist.findMany();
  }

  async findOne(id: string) {
    validateUuid(id, 'artistId');
    const artist = await this.prisma.artist.findUnique({ where: { id } });
    if (!artist) {
      throw new NotFoundException(ERROR_MESSAGES.ARTIST_NOT_FOUND);
    }
    return artist;
  }

  async update(id: string, updateArtistDto: UpdateArtistDto) {
    validateUuid(id, 'artistId');
    const artist = await this.prisma.artist.findUnique({ where: { id } });
    if (!artist) {
      throw new NotFoundException(ERROR_MESSAGES.ARTIST_NOT_FOUND);
    }
    return this.prisma.artist.update({
      where: { id },
      data: {
        name: updateArtistDto.name ?? artist.name,
        grammy: updateArtistDto.grammy ?? artist.grammy,
      },
    });
  }

  async remove(id: string) {
    validateUuid(id, 'artistId');
    const artist = await this.prisma.artist.findUnique({ where: { id } });
    if (!artist) {
      throw new NotFoundException(ERROR_MESSAGES.ARTIST_NOT_FOUND);
    }
    await this.prisma.artist.delete({ where: { id } });
  }
}
