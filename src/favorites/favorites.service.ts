import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { validateUuid } from '../common/utils/uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    const [artistFavs, albumFavs, trackFavs] = await Promise.all([
      this.prisma.favoriteArtist.findMany({ include: { artist: true } }),
      this.prisma.favoriteAlbum.findMany({ include: { album: true } }),
      this.prisma.favoriteTrack.findMany({ include: { track: true } }),
    ]);

    return {
      artists: artistFavs.map(({ artist }) => artist),
      albums: albumFavs.map(({ album }) => album),
      tracks: trackFavs.map(({ track }) => track),
    };
  }

  async addTrack(id: string) {
    validateUuid(id, 'trackId');
    const exists = await this.prisma.track.findUnique({ where: { id } });
    if (!exists) {
      throw new UnprocessableEntityException('Track with id does not exist');
    }
    await this.prisma.favoriteTrack.upsert({
      where: { trackId: id },
      update: {},
      create: { trackId: id },
    });
  }

  async addAlbum(id: string) {
    validateUuid(id, 'albumId');
    const exists = await this.prisma.album.findUnique({ where: { id } });
    if (!exists) {
      throw new UnprocessableEntityException('Album with id does not exist');
    }
    await this.prisma.favoriteAlbum.upsert({
      where: { albumId: id },
      update: {},
      create: { albumId: id },
    });
  }

  async addArtist(id: string) {
    validateUuid(id, 'artistId');
    const exists = await this.prisma.artist.findUnique({ where: { id } });
    if (!exists) {
      throw new UnprocessableEntityException('Artist with id does not exist');
    }
    await this.prisma.favoriteArtist.upsert({
      where: { artistId: id },
      update: {},
      create: { artistId: id },
    });
  }

  async removeTrack(id: string) {
    validateUuid(id, 'trackId');
    const favorite = await this.prisma.favoriteTrack.findUnique({
      where: { trackId: id },
    });
    if (!favorite) {
      throw new NotFoundException('Track not favorite');
    }
    await this.prisma.favoriteTrack.delete({ where: { trackId: id } });
  }

  async removeAlbum(id: string) {
    validateUuid(id, 'albumId');
    const favorite = await this.prisma.favoriteAlbum.findUnique({
      where: { albumId: id },
    });
    if (!favorite) {
      throw new NotFoundException('Album not favorite');
    }
    await this.prisma.favoriteAlbum.delete({ where: { albumId: id } });
  }

  async removeArtist(id: string) {
    validateUuid(id, 'artistId');
    const favorite = await this.prisma.favoriteArtist.findUnique({
      where: { artistId: id },
    });
    if (!favorite) {
      throw new NotFoundException('Artist not favorite');
    }
    await this.prisma.favoriteArtist.delete({ where: { artistId: id } });
  }
}
