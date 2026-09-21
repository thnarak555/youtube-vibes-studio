import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Heart, 
  Music, 
  User, 
  Disc, 
  Play, 
  Search, 
  Loader2, 
  ExternalLink
} from 'lucide-react';
import { useFavoriteStore } from '../../stores/useFavoriteStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLyricStore } from '../../stores/useLyricStore';
import { getNeteaseAudioUrl, fetchNeteaseLyrics, fetchArtistSongs, fetchAlbumSongs } from '../../api/netease';
import type { NeteaseSongItem, NeteaseArtistItem, NeteaseAlbumItem } from '../../api/netease';
import { YesPlayCover } from './YesPlayCover';
import { YesPlayArtistCard } from './YesPlayArtistCard';
import { formatTime } from '../../utils/timeFormat';
import { playTapSound, playSuccessSound } from '../../utils/soundEffects';
import { logger } from '../../services/logger';
import { cn } from '../../utils/cn';

interface UserLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadAudioSrc: (src: string) => void;
  onOpenSearchWithQuery?: (query: string) => void;
}

type LibraryTab = 'songs' | 'artists' | 'albums';

export const UserLibraryModal: React.FC<UserLibraryModalProps> = ({
  isOpen,
  onClose,
  onLoadAudioSrc,
  onOpenSearchWithQuery
}) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('songs');
  const [searchFilter, setSearchFilter] = useState('');
  const [loadingSongId, setLoadingSongId] = useState<number | null>(null);

  // Detail view inside library for viewing songs of a selected artist or album
  const [selectedArtist, setSelectedArtist] = useState<NeteaseArtistItem | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<NeteaseAlbumItem | null>(null);
  const [detailSongs, setDetailSongs] = useState<NeteaseSongItem[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const { 
    favoriteSongs, 
    favoriteArtists, 
    favoriteAlbums, 
    toggleFavoriteSong 
  } = useFavoriteStore();

  const { isLoggedIn, userProfile } = useAuthStore();
  const { metadata, setMetadata, setLyrics, toggleFavoriteCurrentSong, isCurrentSongFavorite } = useLyricStore();

  const isCurrentFavorite = isCurrentSongFavorite();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedArtist || selectedAlbum) {
          setSelectedArtist(null);
          setSelectedAlbum(null);
          setDetailSongs([]);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedArtist, selectedAlbum]);

  // Filtered lists
  const filteredSongs = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return favoriteSongs;
    return favoriteSongs.filter(
      s => s.name.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q)
    );
  }, [favoriteSongs, searchFilter]);

  const filteredArtists = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return favoriteArtists;
    return favoriteArtists.filter(a => a.name.toLowerCase().includes(q));
  }, [favoriteArtists, searchFilter]);

  const filteredAlbums = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return favoriteAlbums;
    return favoriteAlbums.filter(
      al => al.name.toLowerCase().includes(q) || al.artist.toLowerCase().includes(q)
    );
  }, [favoriteAlbums, searchFilter]);

  // Load song into studio
  const handlePlaySong = async (song: NeteaseSongItem) => {
    playTapSound();
    setLoadingSongId(song.id);
    try {
      const audioUrl = await getNeteaseAudioUrl(song.id);
      const lyricResult = await fetchNeteaseLyrics(song.id);

      setMetadata({
        title: song.name,
        artist: song.artist,
        album: song.album,
        coverUrl: song.coverUrl,
        duration: song.duration,
        audioSrc: audioUrl
      });

      if (lyricResult.lyrics.length > 0) {
        setLyrics(lyricResult.lyrics);
      } else {
        setLyrics([{
          id: 'line-1',
          inTime: 0,
          outTime: song.duration > 0 ? Math.min(10, song.duration) : 5,
          original: song.name,
          translation: '',
          referenceTranslation: '',
          originalInTime: 0,
          originalOutTime: song.duration > 0 ? Math.min(10, song.duration) : 5
        }]);
      }

      onLoadAudioSrc(audioUrl);
      playSuccessSound();
      onClose();
    } catch (err: any) {
      logger.error('[USER_LIBRARY]', 'Failed to load song:', err);
      setMetadata({
        title: song.name,
        artist: song.artist,
        album: song.album,
        coverUrl: song.coverUrl,
        duration: song.duration
      });
      onClose();
    } finally {
      setLoadingSongId(null);
    }
  };

  // Open Artist Songs
  const handleOpenArtist = async (artist: NeteaseArtistItem) => {
    playTapSound();
    setSelectedArtist(artist);
    setSelectedAlbum(null);
    setIsDetailLoading(true);
    try {
      const songs = await fetchArtistSongs(artist.id);
      setDetailSongs(songs);
    } catch (err) {
      logger.error('[USER_LIBRARY]', `Failed to fetch songs for artist ${artist.name}:`, err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Open Album Songs
  const handleOpenAlbum = async (album: NeteaseAlbumItem) => {
    playTapSound();
    setSelectedAlbum(album);
    setSelectedArtist(null);
    setIsDetailLoading(true);
    try {
      const songs = await fetchAlbumSongs(album.id);
      setDetailSongs(songs);
    } catch (err) {
      logger.error('[USER_LIBRARY]', `Failed to fetch songs for album ${album.name}:`, err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/55 backdrop-blur-xs animate-fade-in">
      <div 
        className="liquid-glass w-full max-w-4xl h-[88vh] max-h-[760px] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 flex-shrink-0 bg-white/[0.02]">
          {/* User Profile / Library Title */}
          <div className="flex items-center gap-3">
            {isLoggedIn && userProfile?.avatarUrl ? (
              <img 
                src={userProfile.avatarUrl} 
                alt={userProfile.nickname} 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                <Heart className="w-5 h-5 fill-white/30" />
              </div>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {isLoggedIn && userProfile?.nickname 
                  ? `คลังเพลงของ ${userProfile.nickname}` 
                  : 'คลังเพลงของคุณ'}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white/10 text-white/80 border border-white/15">
                  {favoriteSongs.length + favoriteArtists.length + favoriteAlbums.length} รายการ
                </span>
              </h2>
              <p className="text-xs text-white/50">
                เพลงโปรด ศิลปิน และอัลบั้มที่บันทึกไว้
              </p>
            </div>
          </div>

          {/* Right Controls: Add current song & Close */}
          <div className="flex items-center gap-2">
            {metadata.title && (
              <button
                onClick={() => {
                  playTapSound();
                  toggleFavoriteCurrentSong();
                }}
                className={cn(
                  "min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border whitespace-nowrap active:scale-95",
                  isCurrentFavorite
                    ? "bg-white text-black border-white shadow-md font-bold"
                    : "bg-white/5 text-white/80 hover:text-white hover:bg-white/10 border-white/10"
                )}
                title={isCurrentFavorite ? "นำเพลงปัจจุบันออกจากรายการโปรด" : "เพิ่มเพลงปัจจุบันลงในรายการโปรด"}
              >
                <Heart className={cn("w-3.5 h-3.5", isCurrentFavorite ? "fill-black text-black" : "text-white/60")} />
                <span>{isCurrentFavorite ? 'อยู่ในรายการโปรดแล้ว' : 'บันทึกเพลงปัจจุบัน'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="px-6 py-3 border-b border-white/5 bg-white/[0.01] flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
          {/* 3 Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => {
                playTapSound();
                setActiveTab('songs');
                setSelectedArtist(null);
                setSelectedAlbum(null);
              }}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                activeTab === 'songs' && !selectedArtist && !selectedAlbum
                  ? "bg-white/15 text-white shadow-sm border border-white/20"
                  : "text-white/60 hover:text-white"
              )}
            >
              <Music className="w-3.5 h-3.5" />
              <span>เพลงที่ชอบ</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10">
                {favoriteSongs.length}
              </span>
            </button>

            <button
              onClick={() => {
                playTapSound();
                setActiveTab('artists');
                setSelectedArtist(null);
                setSelectedAlbum(null);
              }}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                activeTab === 'artists' && !selectedArtist && !selectedAlbum
                  ? "bg-white/15 text-white shadow-sm border border-white/20"
                  : "text-white/60 hover:text-white"
              )}
            >
              <User className="w-3.5 h-3.5" />
              <span>ศิลปินที่ชอบ</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10">
                {favoriteArtists.length}
              </span>
            </button>

            <button
              onClick={() => {
                playTapSound();
                setActiveTab('albums');
                setSelectedArtist(null);
                setSelectedAlbum(null);
              }}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                activeTab === 'albums' && !selectedArtist && !selectedAlbum
                  ? "bg-white/15 text-white shadow-sm border border-white/20"
                  : "text-white/60 hover:text-white"
              )}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>อัลบั้มที่ชอบ</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10">
                {favoriteAlbums.length}
              </span>
            </button>
          </div>

          {/* In-Library Search Input */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="ค้นหาในคลังนี้..."
              className="bg-transparent text-xs text-white placeholder-white/40 outline-none w-full"
            />
            {searchFilter && (
              <button 
                onClick={() => setSearchFilter('')}
                className="text-white/40 hover:text-white text-xs cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* SUBVIEW: Detail view of an artist or album */}
          {(selectedArtist || selectedAlbum) ? (
            <div className="flex flex-col gap-5">
              {/* Back Button and Detail Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedArtist(null);
                    setSelectedAlbum(null);
                    setDetailSongs([]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-white/10"
                >
                  <span>กลับหน้ารายการ</span>
                </button>

                {onOpenSearchWithQuery && (
                  <button
                    onClick={() => {
                      const q = selectedArtist ? selectedArtist.name : selectedAlbum?.name || '';
                      onClose();
                      onOpenSearchWithQuery(q);
                    }}
                    className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>ค้นหาเพิ่มเติมใน NetEase</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Header Info */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <img 
                  src={selectedArtist?.picUrl || selectedAlbum?.picUrl || ''} 
                  alt={selectedArtist?.name || selectedAlbum?.name}
                  className={cn(
                    "w-20 h-20 object-cover border border-white/10 shadow-lg",
                    selectedArtist ? "rounded-full" : "rounded-2xl"
                  )}
                />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedArtist?.name || selectedAlbum?.name}
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    {selectedArtist ? 'ศิลปินที่บันทึกไว้' : `อัลบั้มโดย ${selectedAlbum?.artist}`}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {detailSongs.length} เพลง
                  </p>
                </div>
              </div>

              {/* Songs List */}
              {isDetailLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-white/40">
                  <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                  <span className="text-xs">กำลังโหลดรายชื่อเพลง...</span>
                </div>
              ) : detailSongs.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-xs">
                  ไม่พบเพลงสำหรับรายการนี้
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {detailSongs.map((song, idx) => (
                    <div
                      key={song.id}
                      onClick={() => handlePlaySong(song)}
                      className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.06] transition-all cursor-pointer border border-transparent hover:border-white/10"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 text-center text-xs font-mono text-white/30 group-hover:text-white/60">
                          {loadingSongId === song.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white/60 mx-auto" />
                          ) : (
                            idx + 1
                          )}
                        </span>
                        {song.coverUrl && (
                          <img src={song.coverUrl} alt={song.name} className="w-10 h-10 rounded-xl object-cover" />
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate group-hover:text-white transition-colors">
                            {song.name}
                          </h4>
                          <p className="text-[11px] text-white/45 truncate">
                            {song.artist}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-white/40">
                          {formatTime(song.duration)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteSong(song);
                          }}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                          title="บันทึกในเพลงโปรด"
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'songs' ? (
            /* TAB 1: LIKED SONGS */
            filteredSongs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 mb-3 shadow-xl">
                  <Music className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-white/80">ยังไม่มีเพลงในรายการโปรด</h3>
                <p className="text-xs text-white/40 mt-1 max-w-sm">
                  {searchFilter 
                    ? 'ไม่พบเพลงที่ตรงกับคำค้นหา' 
                    : 'คุณสามารถกดรูปหัวใจที่เพลงขณะฟัง หรือค้นหาเพลงเพื่อบันทึกไว้ที่นี่ได้'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {filteredSongs.map((song, idx) => (
                  <div
                    key={song.id}
                    onClick={() => handlePlaySong(song)}
                    className="group flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.06] transition-all cursor-pointer border border-transparent hover:border-white/10 active:scale-[0.99]"
                  >
                    {/* Left: Index, Cover, Title, Artist, Album */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <span className="w-6 text-center text-xs font-mono text-white/30 group-hover:text-white/60 flex-shrink-0">
                        {loadingSongId === song.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white/60 mx-auto" />
                        ) : (
                          idx + 1
                        )}
                      </span>

                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
                        {song.coverUrl ? (
                          <img src={song.coverUrl} alt={song.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/30">
                            <Music className="w-5 h-5" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="w-4 h-4 fill-white text-white" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="text-xs font-semibold text-white truncate group-hover:text-white transition-colors">
                          {song.name}
                        </h4>
                        <p className="text-[11px] text-white/45 truncate">
                          {[song.artist, song.album].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                    </div>

                    {/* Right: Duration & Remove Favorite Button */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-mono text-white/40">
                        {formatTime(song.duration)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTapSound();
                          toggleFavoriteSong(song);
                        }}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
                        title="ลบออกจากรายการโปรด"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'artists' ? (
            /* TAB 2: FAVORITE ARTISTS */
            filteredArtists.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-3 shadow-xl">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-white/80">ยังไม่มีศิลปินในรายการโปรด</h3>
                <p className="text-xs text-white/40 mt-1 max-w-sm">
                  {searchFilter 
                    ? 'ไม่พบศิลปินที่ตรงกับคำค้นหา' 
                    : 'คุณสามารถกดรูปหัวใจที่การ์ดศิลปินในหน้าค้นหาเพื่อบันทึกศิลปินที่ชื่นชอบ'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredArtists.map(artist => (
                  <YesPlayArtistCard
                    key={artist.id}
                    id={artist.id}
                    name={artist.name}
                    picUrl={artist.picUrl}
                    subText="คลิกเพื่อดูเพลง"
                    onClick={() => handleOpenArtist(artist)}
                  />
                ))}
              </div>
            )
          ) : (
            /* TAB 3: FAVORITE ALBUMS */
            filteredAlbums.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-3 shadow-xl">
                  <Disc className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-white/80">ยังไม่มีอัลบั้มในรายการโปรด</h3>
                <p className="text-xs text-white/40 mt-1 max-w-sm">
                  {searchFilter 
                    ? 'ไม่พบอัลบั้มที่ตรงกับคำค้นหา' 
                    : 'คุณสามารถกดรูปหัวใจที่อัลบั้มในหน้าค้นหาเพื่อบันทึกอัลบั้มที่ชื่นชอบ'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredAlbums.map(album => (
                  <YesPlayCover
                    key={album.id}
                    id={album.id}
                    title={album.name}
                    subtitle={album.artist}
                    imageUrl={album.picUrl}
                    onClick={() => handleOpenAlbum(album)}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
