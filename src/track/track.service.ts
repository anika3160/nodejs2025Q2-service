import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { validateUuid } from '../common/utils/uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { ERROR_MESSAGES } from 'src/common/constants';

@Injectable()
export class TrackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTrackDto: CreateTrackDto) {
    const track = await this.prisma.track.create({
      data: {
        id: randomUUID(),
        name: createTrackDto.name,
        duration: createTrackDto.duration,
        artistId: await this.resolveArtistId(createTrackDto.artistId),
        albumId: await this.resolveAlbumId(createTrackDto.albumId),
      },
    });
    return track;
  }

  findAll() {
    return this.prisma.track.findMany();
  }

  async findOne(id: string) {
    validateUuid(id, 'trackId');
    const track = await this.prisma.track.findUnique({ where: { id } });
    if (!track) {
      throw new NotFoundException(ERROR_MESSAGES.TRACK_NOT_FOUND);
    }
    return track;
  }

  async update(id: string, updateTrackDto: UpdateTrackDto) {
    validateUuid(id, 'trackId');
    const track = await this.prisma.track.findUnique({ where: { id } });
    if (!track) {
      throw new NotFoundException(ERROR_MESSAGES.TRACK_NOT_FOUND);
    }

    const updatedTrack = await this.prisma.track.update({
      where: { id },
      data: {
        name: updateTrackDto.name ?? track.name,
        duration: updateTrackDto.duration ?? track.duration,
        artistId:
          updateTrackDto.artistId !== undefined
            ? await this.resolveArtistId(updateTrackDto.artistId)
            : track.artistId,
        albumId:
          updateTrackDto.albumId !== undefined
            ? await this.resolveAlbumId(updateTrackDto.albumId)
            : track.albumId,
      },
    });

    return updatedTrack;
  }

  async remove(id: string) {
    validateUuid(id, 'trackId');
    const track = await this.prisma.track.findUnique({ where: { id } });
    if (!track) {
      throw new NotFoundException(ERROR_MESSAGES.TRACK_NOT_FOUND);
    }
    await this.prisma.track.delete({ where: { id } });
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

  private async resolveAlbumId(albumId?: string | null) {
    if (albumId === undefined) {
      return null;
    }

    if (albumId === null) {
      return null;
    }

    validateUuid(albumId, 'albumId');
    const exists = await this.prisma.album.findUnique({
      where: { id: albumId },
    });
    if (!exists) {
      throw new UnprocessableEntityException('Album with id does not exist');
    }
    return albumId;
  }
}
