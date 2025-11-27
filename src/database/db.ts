import Album from '../album/entities/album.entity';
import Artist from '../artist/entities/artist.entity';
import Favorites from '../favorites/entities/favorites.entity';
import Track from '../track/entities/track.entity';
import User from '../user/entities/user.entity';

type Db = {
  users: User[];
  artists: Artist[];
  tracks: Track[];
  albums: Album[];
  favorites: Favorites;
};

const db: Db = {
  users: [],
  artists: [],
  tracks: [],
  albums: [],
  favorites: {
    artists: [],
    albums: [],
    tracks: [],
  },
};

export default db;
