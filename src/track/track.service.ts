import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { validateUuid } from '../common/utils/uuid';
import db from '../database/db';
import Track from './entities/track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';

@Injectable()
export class TrackService {
  create(createTrackDto: CreateTrackDto) {
    const track: Track = {
      id: randomUUID(),
      name: createTrackDto.name,
      artistId: createTrackDto.artistId ?? null,
      albumId: createTrackDto.albumId ?? null,
      duration: createTrackDto.duration,
    };
    db.tracks.push(track);
    return track;
  }

  findAll() {
    return db.tracks;
  }

  findOne(id: string) {
    validateUuid(id, 'trackId');
    const track = db.tracks.find((item) => item.id === id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return track;
  }

  update(id: string, updateTrackDto: UpdateTrackDto) {
    validateUuid(id, 'trackId');
    const track = db.tracks.find((item) => item.id === id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    if (updateTrackDto.name !== undefined) track.name = updateTrackDto.name;
    if (updateTrackDto.artistId !== undefined)
      track.artistId = updateTrackDto.artistId;
    if (updateTrackDto.albumId !== undefined)
      track.albumId = updateTrackDto.albumId;
    if (updateTrackDto.duration !== undefined)
      track.duration = updateTrackDto.duration;
    return track;
  }

  remove(id: string) {
    validateUuid(id, 'trackId');
    const index = db.tracks.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException('Track not found');
    }
    db.tracks.splice(index, 1);
    db.favorites.tracks = db.favorites.tracks.filter((item) => item !== id);
  }
}
