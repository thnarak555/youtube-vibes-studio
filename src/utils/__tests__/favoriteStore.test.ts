import { describe, it, expect, beforeEach } from 'vitest';
import { useFavoriteStore } from '../../stores/useFavoriteStore';

describe('useFavoriteStore', () => {
  beforeEach(() => {
    useFavoriteStore.setState({
      favoriteArtists: [],
      favoriteAlbums: [],
      favoriteSongs: []
    });
  });

  it('toggles favorite artist correctly', () => {
    const artist = { id: 101, name: 'Radwimps', picUrl: 'https://example.com/radwimps.jpg' };
    expect(useFavoriteStore.getState().isFavoriteArtist(101)).toBe(false);

    useFavoriteStore.getState().toggleFavoriteArtist(artist);
    expect(useFavoriteStore.getState().isFavoriteArtist(101)).toBe(true);
    expect(useFavoriteStore.getState().favoriteArtists.length).toBe(1);

    useFavoriteStore.getState().toggleFavoriteArtist(artist);
    expect(useFavoriteStore.getState().isFavoriteArtist(101)).toBe(false);
    expect(useFavoriteStore.getState().favoriteArtists.length).toBe(0);
  });

  it('toggles favorite album correctly', () => {
    const album = { id: 202, name: 'Your Name OST', artist: 'Radwimps', picUrl: 'https://example.com/cover.jpg' };
    expect(useFavoriteStore.getState().isFavoriteAlbum(202)).toBe(false);

    useFavoriteStore.getState().toggleFavoriteAlbum(album);
    expect(useFavoriteStore.getState().isFavoriteAlbum(202)).toBe(true);
    expect(useFavoriteStore.getState().favoriteAlbums.length).toBe(1);

    useFavoriteStore.getState().toggleFavoriteAlbum(album);
    expect(useFavoriteStore.getState().isFavoriteAlbum(202)).toBe(false);
    expect(useFavoriteStore.getState().favoriteAlbums.length).toBe(0);
  });

  it('toggles favorite song correctly', () => {
    const song = {
      id: 303,
      name: 'Sparkle',
      artist: 'Radwimps',
      album: 'Your Name OST',
      coverUrl: 'https://example.com/cover.jpg',
      duration: 538
    };
    expect(useFavoriteStore.getState().isFavoriteSong(303)).toBe(false);

    useFavoriteStore.getState().toggleFavoriteSong(song);
    expect(useFavoriteStore.getState().isFavoriteSong(303)).toBe(true);
    expect(useFavoriteStore.getState().favoriteSongs.length).toBe(1);

    useFavoriteStore.getState().toggleFavoriteSong(song);
    expect(useFavoriteStore.getState().isFavoriteSong(303)).toBe(false);
    expect(useFavoriteStore.getState().favoriteSongs.length).toBe(0);
  });
});
