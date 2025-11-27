import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { validateUuid } from '../common/utils/uuid';
import db from '../database/db';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import Album from './entities/album.entity';

@Injectable()
export class AlbumService {
  create(createAlbumDto: CreateAlbumDto) {
    const album: Album = {
      id: randomUUID(),
      name: createAlbumDto.name,
      year: createAlbumDto.year,
      artistId: createAlbumDto.artistId ?? null,
    };
    db.albums.push(album);
    return album;
  }

  findAll() {
    return db.albums;
  }

  findOne(id: string) {
    validateUuid(id, 'albumId');
    const album = db.albums.find((item) => item.id === id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }
    return album;
  }

  update(id: string, updateAlbumDto: UpdateAlbumDto) {
    validateUuid(id, 'albumId');
    const album = db.albums.find((item) => item.id === id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }
    if (updateAlbumDto.name !== undefined) album.name = updateAlbumDto.name;
    if (updateAlbumDto.year !== undefined) album.year = updateAlbumDto.year;
    if (updateAlbumDto.artistId !== undefined)
      album.artistId = updateAlbumDto.artistId;
    return album;
  }

  remove(id: string) {
    validateUuid(id, 'albumId');
    const index = db.albums.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException('Album not found');
    }
    db.albums.splice(index, 1);
    db.favorites.albums = db.favorites.albums.filter((item) => item !== id);
    db.tracks = db.tracks.map((track) =>
      track.albumId === id ? { ...track, albumId: null } : track,
    );
  }
}
