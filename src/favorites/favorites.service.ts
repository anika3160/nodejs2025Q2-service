import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { validateUuid } from '../common/utils/uuid';
import db from '../database/db';

@Injectable()
export class FavoritesService {
  getAll() {
    return {
      artists: db.artists.filter((artist) =>
        db.favorites.artists.includes(artist.id),
      ),
      albums: db.albums.filter((album) =>
        db.favorites.albums.includes(album.id),
      ),
      tracks: db.tracks.filter((track) =>
        db.favorites.tracks.includes(track.id),
      ),
    };
  }

  addTrack(id: string) {
    validateUuid(id, 'trackId');
    const exists = db.tracks.some((track) => track.id === id);
    if (!exists) {
      throw new UnprocessableEntityException('Track with id does not exist');
    }
    if (!db.favorites.tracks.includes(id)) {
      db.favorites.tracks.push(id);
    }
  }

  addAlbum(id: string) {
    validateUuid(id, 'albumId');
    const exists = db.albums.some((album) => album.id === id);
    if (!exists) {
      throw new UnprocessableEntityException('Album with id does not exist');
    }
    if (!db.favorites.albums.includes(id)) {
      db.favorites.albums.push(id);
    }
  }

  addArtist(id: string) {
    validateUuid(id, 'artistId');
    const exists = db.artists.some((artist) => artist.id === id);
    if (!exists) {
      throw new UnprocessableEntityException('Artist with id does not exist');
    }
    if (!db.favorites.artists.includes(id)) {
      db.favorites.artists.push(id);
    }
  }

  removeTrack(id: string) {
    validateUuid(id, 'trackId');
    const found = db.favorites.tracks.includes(id);
    if (!found) {
      throw new NotFoundException('Track not favorite');
    }
    db.favorites.tracks = db.favorites.tracks.filter((item) => item !== id);
  }

  removeAlbum(id: string) {
    validateUuid(id, 'albumId');
    const found = db.favorites.albums.includes(id);
    if (!found) {
      throw new NotFoundException('Album not favorite');
    }
    db.favorites.albums = db.favorites.albums.filter((item) => item !== id);
  }

  removeArtist(id: string) {
    validateUuid(id, 'artistId');
    const found = db.favorites.artists.includes(id);
    if (!found) {
      throw new NotFoundException('Artist not favorite');
    }
    db.favorites.artists = db.favorites.artists.filter((item) => item !== id);
  }
}
