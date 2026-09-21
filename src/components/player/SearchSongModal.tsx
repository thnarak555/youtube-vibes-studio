import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Loader2, 
  ArrowLeft,
  Play,
  Heart,
  Flame,
  Mic2,
  Sparkles,
  Disc
} from 'lucide-react';
import { 
  searchNeteaseMulti,
  searchNeteaseSongs,
  searchNeteaseArtists,
  searchNeteaseAlbums,
  fetchNeteaseLyrics, 
  getNeteaseAudioUrl,
  fetchTopSongs,
  fetchTopArtists,
  fetchNewReleases,
  fetchTopAlbums,
  fetchArtistSongs,
  fetchAlbumSongs
} from '../../api/netease';
import type { 
  NeteaseSongItem, 
  NeteaseArtistItem, 
  NeteaseAlbumItem 
} from '../../api/netease';
import { YesPlayCover } from './YesPlayCover';
import { YesPlayArtistCard } from './YesPlayArtistCard';
import { YesPlayTrackRow } from './YesPlayTrackRow';
import { useLyricStore } from '../../stores/useLyricStore';
import { useFavoriteStore } from '../../stores/useFavoriteStore';
import { playTapSound, playSuccessSound } from '../../utils/soundEffects';
import { logger } from '../../services/logger';
import type { LyricLine } from '../../types';
import { cn } from '../../utils/cn';

interface SearchSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadAudioSrc: (src: string) => void;
}

// Views mirroring YesPlayMusic-MaO routes
type ModalView = 'explore' | 'search' | 'searchType' | 'artist' | 'album';
type SearchCategory = 'tracks' | 'artists' | 'albums';
type ExploreCategory = 'charts' | 'artists' | 'releases' | 'albums' | 'favorites';

export const SearchSongModal: React.FC<SearchSongModalProps> = ({
  isOpen,
  onClose,
  onLoadAudioSrc
}) => {
  // Navigation stack state
  const [currentView, setCurrentView] = useState<ModalView>('explore');
  const [searchCategory, setSearchCategory] = useState<SearchCategory>('tracks');
  const [exploreCategory, setExploreCategory] = useState<ExploreCategory>('charts');

  // Input & search state
  const [query, setQuery] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSongId, setLoadingSongId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // YesPlayMusic search.vue data
  const [combinedTracks, setCombinedTracks] = useState<NeteaseSongItem[]>([]);
  const [combinedArtists, setCombinedArtists] = useState<NeteaseArtistItem[]>([]);
  const [combinedAlbums, setCombinedAlbums] = useState<NeteaseAlbumItem[]>([]);

  // YesPlayMusic searchType.vue data
  const [typeResults, setTypeResults] = useState<any[]>([]);

  // YesPlayMusic explore.vue data
  const [exploreSongs, setExploreSongs] = useState<NeteaseSongItem[]>([]);
  const [exploreArtists, setExploreArtists] = useState<NeteaseArtistItem[]>([]);
  const [exploreReleases, setExploreReleases] = useState<NeteaseAlbumItem[]>([]);
  const [exploreAlbums, setExploreAlbums] = useState<NeteaseAlbumItem[]>([]);

  // Favorites store
  const { favoriteArtists, favoriteAlbums, favoriteSongs } = useFavoriteStore();

  // YesPlayMusic artist.vue / album.vue data
  const [selectedArtist, setSelectedArtist] = useState<NeteaseArtistItem | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<NeteaseAlbumItem | null>(null);
  const [detailSongs, setDetailSongs] = useState<NeteaseSongItem[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const { setLyrics, setMetadata } = useLyricStore();

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load explore data on mount / explore category change
  useEffect(() => {
    if (!isOpen) return;
    if (currentView === 'explore') {
      loadExploreData(exploreCategory);
    }
  }, [isOpen, currentView, exploreCategory]);

  const loadExploreData = async (cat: ExploreCategory) => {
    if (cat === 'favorites') return;
    setIsLoading(true);
    setError(null);
    try {
      if (cat === 'charts' && exploreSongs.length === 0) {
        const items = await fetchTopSongs();
        setExploreSongs(items);
      } else if (cat === 'artists' && exploreArtists.length === 0) {
        const items = await fetchTopArtists();
        setExploreArtists(items);
      } else if (cat === 'releases' && exploreReleases.length === 0) {
        const items = await fetchNewReleases();
        setExploreReleases(items);
      } else if (cat === 'albums' && exploreAlbums.length === 0) {
        const items = await fetchTopAlbums();
        setExploreAlbums(items);
      }
    } catch (err: any) {
      logger.error('[SEARCH_MODAL]', `Failed to load explore data for ${cat}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform search (search.vue style)
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if (!clean) {
      setCurrentView('explore');
      return;
    }

    setIsLoading(true);
    setError(null);
    setActiveKeyword(clean);
    setCurrentView('search');

    try {
      const res = await searchNeteaseMulti(clean);
      setCombinedTracks(res.tracks || []);
      setCombinedArtists(res.artists || []);
      setCombinedAlbums(res.albums || []);

      if (!res.tracks?.length && !res.artists?.length && !res.albums?.length) {
        setError(`ไม่พบผลลัพธ์สำหรับ "${clean}"`);
      }
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการค้นหา');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to searchType.vue (dedicated category search)
  const openSearchType = async (category: SearchCategory) => {
    playTapSound();
    setSearchCategory(category);
    setCurrentView('searchType');
    setIsLoading(true);
    setError(null);

    try {
      if (category === 'tracks') {
        const items = await searchNeteaseSongs(activeKeyword);
        setTypeResults(items);
      } else if (category === 'artists') {
        const items = await searchNeteaseArtists(activeKeyword);
        setTypeResults(items);
      } else if (category === 'albums') {
        const items = await searchNeteaseAlbums(activeKeyword);
        setTypeResults(items);
      }
    } catch (err: any) {
      logger.error('[SEARCH_MODAL]', `Failed to search type ${category}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  // Open artist.vue
  const handleSelectArtist = async (artist: NeteaseArtistItem) => {
    playTapSound();
    setSelectedArtist(artist);
    setSelectedAlbum(null);
    setCurrentView('artist');
    setIsDetailLoading(true);
    try {
      const songs = await fetchArtistSongs(artist.id);
      setDetailSongs(songs);
    } catch (err) {
      logger.error('[SEARCH_MODAL]', `Failed to load songs for artist ${artist.name}:`, err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Open album.vue
  const handleSelectAlbum = async (album: NeteaseAlbumItem) => {
    playTapSound();
    setSelectedAlbum(album);
    setSelectedArtist(null);
    setCurrentView('album');
    setIsDetailLoading(true);
    try {
      const songs = await fetchAlbumSongs(album.id);
      setDetailSongs(songs);
    } catch (err) {
      logger.error('[SEARCH_MODAL]', `Failed to load songs for album ${album.name}:`, err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Select song into studio
  const handleSelectSong = async (song: NeteaseSongItem) => {
    playTapSound();
    setLoadingSongId(song.id);
    logger.info('[SEARCH_MODAL]', `Selecting song: ${song.name} (${song.id})`);

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
        const fallbackLine: LyricLine = {
          id: 'line-1',
          inTime: 0,
          outTime: song.duration > 0 ? Math.min(10, song.duration) : 5,
          original: song.name,
          translation: '',
          referenceTranslation: '',
          originalInTime: 0,
          originalOutTime: song.duration > 0 ? Math.min(10, song.duration) : 5
        };
        setLyrics([fallbackLine]);
      }

      onLoadAudioSrc(audioUrl);
      playSuccessSound();
      onClose();
    } catch (err: any) {
      logger.error('[SEARCH_MODAL]', 'Failed to load song or lyrics:', err);
      setMetadata({
        title: song.name,
        artist: song.artist,
        album: song.album,
        coverUrl: song.coverUrl,
        duration: song.duration
      });
      setLyrics([{
        id: 'line-1',
        inTime: 0,
        outTime: song.duration > 0 ? Math.min(10, song.duration) : 5,
        original: song.name,
        translation: '',
        referenceTranslation: ''
      }]);
      onClose();
    } finally {
      setLoadingSongId(null);
    }
  };

  const handleBack = () => {
    playTapSound();
    if (currentView === 'artist' || currentView === 'album') {
      setCurrentView(activeKeyword ? (searchCategory === 'tracks' ? 'search' : 'searchType') : 'explore');
    } else if (currentView === 'searchType') {
      setCurrentView('search');
    } else if (currentView === 'search') {
      setCurrentView('explore');
      setQuery('');
      setActiveKeyword('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/55 backdrop-blur-xs animate-fade-in select-none">
      <div 
        className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-3xl liquid-glass shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Header with Clear Breadcrumbs */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 flex-shrink-0 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            {currentView !== 'explore' && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer border border-white/10"
                title="ย้อนกลับ"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ย้อนกลับ</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                คลังเพลงออนไลน์
              </span>
              <span className="text-xs text-white/50 font-medium">
                • {currentView === 'explore' 
                  ? 'สำรวจ' 
                  : currentView === 'artist' && selectedArtist 
                    ? `ศิลปิน ${selectedArtist.name}` 
                    : currentView === 'album' && selectedAlbum 
                      ? `อัลบั้ม ${selectedAlbum.name}` 
                      : `ค้นหา "${activeKeyword}"`}
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative w-56 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="ค้นหาเพลง ศิลปิน หรืออัลบั้ม..."
                  className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-white/30 transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      if (currentView === 'search' || currentView === 'searchType') {
                        setCurrentView('explore');
                        setActiveKeyword('');
                      }
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs cursor-pointer p-0.5"
                    title="ล้างคำค้นหา"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                title="กดเพื่อค้นหา"
              >
                <Search className="w-3 h-3" />
                <span className="hidden sm:inline">ค้นหา</span>
              </button>
            </form>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="ปิดหน้าต่าง Esc"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="px-6 py-2 text-xs text-rose-300 bg-rose-500/10 border-b border-rose-500/20 text-center font-medium">
            {error}
          </div>
        )}

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-dark select-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-white/50 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-white/80" />
              <span className="text-xs font-medium">กำลังโหลดข้อมูล...</span>
            </div>
          ) : currentView === 'search' ? (
            /* =========================================================================
               VIEW 1: YesPlayMusic search.vue (Combined Two-Column Row + Tracks List)
               ========================================================================= */
            <div className="space-y-8">
              {/* Row: Artists (Left 3 items) & Albums (Right 3 items) */}
              {(combinedArtists.length > 0 || combinedAlbums.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Artists */}
                  {combinedArtists.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white/90">ศิลปิน</h2>
                        <button
                          onClick={() => openSearchType('artists')}
                          className="text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
                        >
                          ดูเพิ่มเติม &gt;
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {combinedArtists.slice(0, 3).map((artist) => (
                          <YesPlayArtistCard
                            key={artist.id}
                            id={artist.id}
                            name={artist.name}
                            picUrl={artist.picUrl}
                            onClick={() => handleSelectArtist(artist)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Right: Albums */}
                  {combinedAlbums.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white/90">อัลบั้ม</h2>
                        <button
                          onClick={() => openSearchType('albums')}
                          className="text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
                        >
                          ดูเพิ่มเติม &gt;
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {combinedAlbums.slice(0, 3).map((album) => (
                          <YesPlayCover
                            key={album.id}
                            id={album.id}
                            title={album.name}
                            subtitle={album.artist}
                            imageUrl={album.picUrl}
                            onClick={() => handleSelectAlbum(album)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom: Tracks List */}
              {combinedTracks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white/90">เพลง</h2>
                    <button
                      onClick={() => openSearchType('tracks')}
                      className="text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                      ดูเพิ่มเติม &gt;
                    </button>
                  </div>
                  <div className="space-y-1">
                    {combinedTracks.slice(0, 12).map((song, idx) => (
                      <YesPlayTrackRow
                        key={song.id}
                        song={song}
                        index={idx + 1}
                        isLoading={loadingSongId === song.id}
                        onSelect={handleSelectSong}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : currentView === 'searchType' ? (
            /* =========================================================================
               VIEW 2: YesPlayMusic searchType.vue (Full Category Grid / List)
               ========================================================================= */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h1 className="text-2xl font-bold text-white">
                  <span className="text-white/40 font-normal">
                    ค้นหา {searchCategory === 'tracks' ? 'เพลง' : searchCategory === 'artists' ? 'ศิลปิน' : 'อัลบั้ม'}
                  </span>{' '}
                  "{activeKeyword}"
                </h1>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openSearchType('tracks')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer",
                      searchCategory === 'tracks' ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    เพลง
                  </button>
                  <button
                    onClick={() => openSearchType('artists')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer",
                      searchCategory === 'artists' ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    ศิลปิน
                  </button>
                  <button
                    onClick={() => openSearchType('albums')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer",
                      searchCategory === 'albums' ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    อัลบั้ม
                  </button>
                </div>
              </div>

              {searchCategory === 'artists' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {typeResults.map((artist: NeteaseArtistItem) => (
                    <YesPlayArtistCard
                      key={artist.id}
                      id={artist.id}
                      name={artist.name}
                      picUrl={artist.picUrl}
                      subText={artist.albumSize ? `${artist.albumSize} อัลบั้ม` : 'ศิลปิน'}
                      onClick={() => handleSelectArtist(artist)}
                    />
                  ))}
                </div>
              ) : searchCategory === 'albums' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {typeResults.map((album: NeteaseAlbumItem) => (
                    <YesPlayCover
                      key={album.id}
                      id={album.id}
                      title={album.name}
                      subtitle={album.artist}
                      imageUrl={album.picUrl}
                      onClick={() => handleSelectAlbum(album)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {typeResults.map((song: NeteaseSongItem, idx) => (
                    <YesPlayTrackRow
                      key={song.id}
                      song={song}
                      index={idx + 1}
                      isLoading={loadingSongId === song.id}
                      onSelect={handleSelectSong}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : currentView === 'artist' && selectedArtist ? (
            /* =========================================================================
               VIEW 3: YesPlayMusic artist.vue (Hero Banner + Top Songs Tracklist)
               ========================================================================= */
            <div className="space-y-8">
              {/* Artist Header Banner */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-white/10">
                <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl flex-shrink-0">
                  <img src={selectedArtist.picUrl} alt={selectedArtist.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <span className="text-xs uppercase tracking-widest text-white/60 font-bold">ศิลปิน</span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{selectedArtist.name}</h1>
                  <p className="text-xs text-white/50">
                    {detailSongs.length} เพลงยอดนิยม {selectedArtist.albumSize ? `· ${selectedArtist.albumSize} อัลบั้ม` : ''}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => detailSongs[0] && handleSelectSong(detailSongs[0])}
                      className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-white/90 active:scale-95 transition-all cursor-pointer shadow-lg mx-auto sm:mx-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>เล่นเพลงยอดนิยม</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Popular Tracks List */}
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white/90 mb-3">เพลงยอดนิยม</h3>
                {isDetailLoading ? (
                  <div className="py-20 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-white/40" /></div>
                ) : (
                  detailSongs.map((song, idx) => (
                    <YesPlayTrackRow
                      key={song.id}
                      song={song}
                      index={idx + 1}
                      isLoading={loadingSongId === song.id}
                      onSelect={handleSelectSong}
                    />
                  ))
                )}
              </div>
            </div>
          ) : currentView === 'album' && selectedAlbum ? (
            /* =========================================================================
               VIEW 4: YesPlayMusic album.vue (Hero Banner + Album Tracklist)
               ========================================================================= */
            <div className="space-y-8">
              {/* Album Header Banner */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-white/10">
                <div className="relative w-44 h-44 rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex-shrink-0">
                  <img src={selectedAlbum.picUrl} alt={selectedAlbum.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <span className="text-xs uppercase tracking-widest text-white/60 font-bold">อัลบั้ม</span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{selectedAlbum.name}</h1>
                  <p className="text-sm font-medium text-white/70">
                    โดย <span className="text-white font-semibold">{selectedAlbum.artist}</span>
                  </p>
                  <p className="text-xs text-white/40">
                    {detailSongs.length} เพลง
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => detailSongs[0] && handleSelectSong(detailSongs[0])}
                      className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-white/90 active:scale-95 transition-all cursor-pointer shadow-lg mx-auto sm:mx-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>เล่นอัลบั้ม</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Album Tracks List */}
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white/90 mb-3">เพลงในอัลบั้ม</h3>
                {isDetailLoading ? (
                  <div className="py-20 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-white/40" /></div>
                ) : (
                  detailSongs.map((song, idx) => (
                    <YesPlayTrackRow
                      key={song.id}
                      song={song}
                      index={idx + 1}
                      isLoading={loadingSongId === song.id}
                      onSelect={handleSelectSong}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            /* =========================================================================
               VIEW 1: YesPlayMusic explore.vue (Explore Categories & Favorites)
               ========================================================================= */
            <div className="space-y-6">
              {/* Category Pills */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2">
                  {(
                    [
                      { id: 'charts', label: 'ชาร์ตเพลงฮิต', icon: Flame },
                      { id: 'artists', label: 'ศิลปินแนะนำ', icon: Mic2 },
                      { id: 'releases', label: 'เพลงออกใหม่', icon: Sparkles },
                      { id: 'albums', label: 'อัลบั้มคัดสรร', icon: Disc },
                    ] as const
                  ).map((cat) => {
                    const Icon = cat.icon;
                    const isActive = exploreCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setExploreCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white text-black shadow-md'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Favorites Tab Button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setExploreCategory('favorites')}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer',
                      exploreCategory === 'favorites'
                        ? 'bg-white text-black shadow-md'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>รายการโปรด {favoriteArtists.length + favoriteAlbums.length + favoriteSongs.length} รายการ</span>
                  </button>
                </div>
              </div>

              {/* Category Content */}
              {exploreCategory === 'favorites' ? (
                <div className="space-y-8">
                  {favoriteArtists.length === 0 && favoriteAlbums.length === 0 && favoriteSongs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/60">
                        <Heart className="w-8 h-8 stroke-[1.5]" />
                      </div>
                      <h3 className="text-base font-bold text-white/80">ยังไม่มีรายการโปรด</h3>
                      <p className="text-xs text-white/40 mt-1 max-w-sm">
                        กดปุ่มรูปหัวใจที่ศิลปิน อัลบั้ม หรือเพลงที่คุณชอบเพื่อบันทึกเป็นทางลัดเรียกใช้ง่ายๆ ที่นี่
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Favorite Artists */}
                      {favoriteArtists.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold text-white/90 mb-4 flex items-center gap-2">
                            <span>ศิลปินที่ชอบ</span>
                            <span className="text-xs font-mono text-white/40 font-normal">{favoriteArtists.length} รายการ</span>
                          </h2>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {favoriteArtists.map((artist) => (
                              <YesPlayArtistCard
                                key={artist.id}
                                id={artist.id}
                                name={artist.name}
                                picUrl={artist.picUrl}
                                subText={artist.albumSize ? `${artist.albumSize} อัลบั้ม` : 'ศิลปิน'}
                                onClick={() => handleSelectArtist(artist)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Favorite Albums */}
                      {favoriteAlbums.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold text-white/90 mb-4 flex items-center gap-2">
                            <span>อัลบั้มที่ชอบ</span>
                            <span className="text-xs font-mono text-white/40 font-normal">{favoriteAlbums.length} รายการ</span>
                          </h2>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                            {favoriteAlbums.map((album) => (
                              <YesPlayCover
                                key={album.id}
                                id={album.id}
                                title={album.name}
                                subtitle={album.artist}
                                imageUrl={album.picUrl}
                                onClick={() => handleSelectAlbum(album)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Favorite Songs */}
                      {favoriteSongs.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold text-white/90 mb-4 flex items-center gap-2">
                            <span>เพลงที่ชอบ</span>
                            <span className="text-xs font-mono text-white/40 font-normal">{favoriteSongs.length} รายการ</span>
                          </h2>
                          <div className="space-y-1">
                            {favoriteSongs.map((song, idx) => (
                              <YesPlayTrackRow
                                key={song.id}
                                song={song}
                                index={idx + 1}
                                isLoading={loadingSongId === song.id}
                                onSelect={handleSelectSong}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : exploreCategory === 'charts' ? (
                <div className="space-y-1">
                  {exploreSongs.map((song, idx) => (
                    <YesPlayTrackRow
                      key={song.id}
                      song={song}
                      index={idx + 1}
                      isLoading={loadingSongId === song.id}
                      onSelect={handleSelectSong}
                    />
                  ))}
                </div>
              ) : exploreCategory === 'artists' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {exploreArtists.map((artist) => (
                    <YesPlayArtistCard
                      key={artist.id}
                      id={artist.id}
                      name={artist.name}
                      picUrl={artist.picUrl}
                      subText={artist.albumSize ? `${artist.albumSize} อัลบั้ม` : 'ศิลปิน'}
                      onClick={() => handleSelectArtist(artist)}
                    />
                  ))}
                </div>
              ) : exploreCategory === 'releases' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {exploreReleases.map((album) => (
                    <YesPlayCover
                      key={album.id}
                      id={album.id}
                      title={album.name}
                      subtitle={album.artist}
                      imageUrl={album.picUrl}
                      onClick={() => handleSelectAlbum(album)}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {exploreAlbums.map((album) => (
                    <YesPlayCover
                      key={album.id}
                      id={album.id}
                      title={album.name}
                      subtitle={album.artist}
                      imageUrl={album.picUrl}
                      onClick={() => handleSelectAlbum(album)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
