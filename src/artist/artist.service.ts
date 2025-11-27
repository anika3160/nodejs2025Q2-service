import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { validateUuid } from '../common/utils/uuid';
import db from '../database/db';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import Artist from './entities/artist.entity';

@Injectable()
export class ArtistService {
  create(createArtistDto: CreateArtistDto) {
    const artist: Artist = {
      id: randomUUID(),
      name: createArtistDto.name,
      grammy: createArtistDto.grammy,
    };
    db.artists.push(artist);
    return artist;
  }

  findAll() {
    return db.artists;
  }

  findOne(id: string) {
    validateUuid(id, 'artistId');
    const artist = db.artists.find((item) => item.id === id);
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }
    return artist;
  }

  update(id: string, updateArtistDto: UpdateArtistDto) {
    validateUuid(id, 'artistId');
    const artist = db.artists.find((item) => item.id === id);
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }
    if (updateArtistDto.name !== undefined) artist.name = updateArtistDto.name;
    if (updateArtistDto.grammy !== undefined)
      artist.grammy = updateArtistDto.grammy;
    return artist;
  }

  remove(id: string) {
    validateUuid(id, 'artistId');
    const index = db.artists.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException('Artist not found');
    }
    db.artists.splice(index, 1);
    db.favorites.artists = db.favorites.artists.filter((item) => item !== id);
    db.albums = db.albums.map((album) =>
      album.artistId === id ? { ...album, artistId: null } : album,
    );
    db.tracks = db.tracks.map((track) =>
      track.artistId === id ? { ...track, artistId: null } : track,
    );
  }
}
