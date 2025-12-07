import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ERROR_MESSAGES } from 'src/common/constants';
import { validateUuid } from '../common/utils/uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Injectable()
export class AlbumService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAlbumDto: CreateAlbumDto) {
    const album = await this.prisma.album.create({
      data: {
        id: randomUUID(),
        name: createAlbumDto.name,
        year: createAlbumDto.year,
        artistId: await this.resolveArtistId(createAlbumDto.artistId),
      },
    });
    return album;
  }

  findAll() {
    return this.prisma.album.findMany();
  }

  async findOne(id: string) {
    validateUuid(id, 'albumId');
    const album = await this.prisma.album.findUnique({ where: { id } });
    if (!album) {
      throw new NotFoundException(ERROR_MESSAGES.ALBUM_NOT_FOUND);
    }
    return album;
  }

  async update(id: string, updateAlbumDto: UpdateAlbumDto) {
    validateUuid(id, 'albumId');
    const album = await this.prisma.album.findUnique({ where: { id } });
    if (!album) {
      throw new NotFoundException(ERROR_MESSAGES.ALBUM_NOT_FOUND);
    }
    const updatedAlbum = await this.prisma.album.update({
      where: { id },
      data: {
        name: updateAlbumDto.name ?? album.name,
        year: updateAlbumDto.year ?? album.year,
        artistId:
          updateAlbumDto.artistId !== undefined
            ? await this.resolveArtistId(updateAlbumDto.artistId)
            : album.artistId,
      },
    });

    return updatedAlbum;
  }

  async remove(id: string) {
    validateUuid(id, 'albumId');
    const album = await this.prisma.album.findUnique({ where: { id } });
    if (!album) {
      throw new NotFoundException(ERROR_MESSAGES.ALBUM_NOT_FOUND);
    }
    await this.prisma.album.delete({ where: { id } });
  }

  private async resolveArtistId(artistId?: string | null) {
    if (artistId === undefined) {
      return null;
    }

    if (artistId === null) {
      return null;
    }

    validateUuid(artistId, 'artistId');
    const exists = await this.prisma.artist.findUnique({
      where: { id: artistId },
    });
    if (!exists) {
      throw new UnprocessableEntityException('Artist with id does not exist');
    }
    return artistId;
  }
}
