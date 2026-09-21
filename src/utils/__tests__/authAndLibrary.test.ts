import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../stores/useAuthStore';
import { useFavoriteStore } from '../../stores/useFavoriteStore';

describe('Auth and User Favorites Library Store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isLoggedIn: false,
      userProfile: null,
      qrKey: '',
      qrCodeImg: '',
      qrStatus: null,
      qrStatusMessage: '',
      cookie: ''
    });

    useFavoriteStore.setState({
      favoriteArtists: [],
      favoriteAlbums: [],
      favoriteSongs: []
    });
  });

  it('manages NetEase login profile and cookie state', () => {
    const mockProfile = {
      userId: 123456,
      nickname: 'MaO Translator',
      avatarUrl: 'https://example.com/avatar.jpg',
      vipType: 11,
      level: 9,
      signature: 'Antigravity Studio',
      follows: 10,
      followeds: 25,
      playlistCount: 5
    };

    useAuthStore.getState().setUserProfile(mockProfile);
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
    expect(useAuthStore.getState().userProfile?.nickname).toBe('MaO Translator');
    expect(useAuthStore.getState().userProfile?.level).toBe(9);

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(useAuthStore.getState().userProfile).toBeNull();
  });

  it('manages favorites categorization across songs, artists, and albums', () => {
    const favStore = useFavoriteStore.getState();

    // 1. Song
    favStore.toggleFavoriteSong({
      id: 1001,
      name: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      coverUrl: 'https://example.com/cover.jpg',
      duration: 210
    });
    expect(useFavoriteStore.getState().isFavoriteSong(1001)).toBe(true);
    expect(useFavoriteStore.getState().favoriteSongs).toHaveLength(1);

    // 2. Artist
    favStore.toggleFavoriteArtist({
      id: 2001,
      name: 'Artist Alpha',
      picUrl: 'https://example.com/artist.jpg'
    });
    expect(useFavoriteStore.getState().isFavoriteArtist(2001)).toBe(true);
    expect(useFavoriteStore.getState().favoriteArtists).toHaveLength(1);

    // 3. Album
    favStore.toggleFavoriteAlbum({
      id: 3001,
      name: 'Album Beta',
      artist: 'Artist Alpha',
      picUrl: 'https://example.com/album.jpg'
    });
    expect(useFavoriteStore.getState().isFavoriteAlbum(3001)).toBe(true);
    expect(useFavoriteStore.getState().favoriteAlbums).toHaveLength(1);

    // Toggle off
    favStore.toggleFavoriteSong({
      id: 1001,
      name: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      coverUrl: 'https://example.com/cover.jpg',
      duration: 210
    });
    expect(useFavoriteStore.getState().isFavoriteSong(1001)).toBe(false);
    expect(useFavoriteStore.getState().favoriteSongs).toHaveLength(0);
  });
});
