import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NeteaseSongItem, NeteaseArtistItem, NeteaseAlbumItem } from '../api/netease';

interface FavoriteState {
  favoriteArtists: NeteaseArtistItem[];
  favoriteAlbums: NeteaseAlbumItem[];
  favoriteSongs: NeteaseSongItem[];

  toggleFavoriteArtist: (artist: NeteaseArtistItem) => void;
  toggleFavoriteAlbum: (album: NeteaseAlbumItem) => void;
  toggleFavoriteSong: (song: NeteaseSongItem) => void;

  isFavoriteArtist: (id: number | string) => boolean;
  isFavoriteAlbum: (id: number | string) => boolean;
  isFavoriteSong: (id: number | string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoriteArtists: [],
      favoriteAlbums: [],
      favoriteSongs: [],

      toggleFavoriteArtist: (artist) => {
        const { favoriteArtists } = get();
        const artists = Array.isArray(favoriteArtists) ? favoriteArtists : [];
        const exists = artists.some((a) => a.id === artist.id);
        if (exists) {
          set({ favoriteArtists: artists.filter((a) => a.id !== artist.id) });
        } else {
          set({ favoriteArtists: [artist, ...artists] });
        }
      },

      toggleFavoriteAlbum: (album) => {
        const { favoriteAlbums } = get();
        const albums = Array.isArray(favoriteAlbums) ? favoriteAlbums : [];
        const exists = albums.some((al) => al.id === album.id);
        if (exists) {
          set({ favoriteAlbums: albums.filter((al) => al.id !== album.id) });
        } else {
          set({ favoriteAlbums: [album, ...albums] });
        }
      },

      toggleFavoriteSong: (song) => {
        const { favoriteSongs } = get();
        const songs = Array.isArray(favoriteSongs) ? favoriteSongs : [];
        const exists = songs.some((s) => s.id === song.id);
        if (exists) {
          set({ favoriteSongs: songs.filter((s) => s.id !== song.id) });
        } else {
          set({ favoriteSongs: [song, ...songs] });
        }
      },

      isFavoriteArtist: (id) => {
        const artists = get().favoriteArtists;
        return Array.isArray(artists) ? artists.some((a) => String(a.id) === String(id)) : false;
      },

      isFavoriteAlbum: (id) => {
        const albums = get().favoriteAlbums;
        return Array.isArray(albums) ? albums.some((al) => String(al.id) === String(id)) : false;
      },

      isFavoriteSong: (id) => {
        const songs = get().favoriteSongs;
        return Array.isArray(songs) ? songs.some((s) => String(s.id) === String(id)) : false;
      }
    }),
    {
      name: 'lyric_studio_favorites_v1'
    }
  )
);
