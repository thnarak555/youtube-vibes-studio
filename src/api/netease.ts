import type { LyricLine } from '../types';
import { parseLrcContent } from '../utils/lrcParser';
import { logger } from '../services/logger';

export interface NeteaseSongItem {
  id: number;
  name: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number;
}

export interface NeteaseArtistItem {
  id: number;
  name: string;
  picUrl: string;
  musicSize?: number;
  albumSize?: number;
}

export interface NeteaseAlbumItem {
  id: number;
  name: string;
  artist: string;
  picUrl: string;
  publishTime?: number;
  size?: number;
}

export interface NeteaseSearchResultGroup {
  tracks: NeteaseSongItem[];
  artists: NeteaseArtistItem[];
  albums: NeteaseAlbumItem[];
}

export async function searchNeteaseMulti(keyword: string): Promise<NeteaseSearchResultGroup> {
  const clean = keyword.trim();
  if (!clean) return { tracks: [], artists: [], albums: [] };

  logger.info('[NETEASE]', `Multi-searching for: "${clean}"`);

  // 1. Try Electron IPC multi-search (concurrent songs, albums, artists)
  if (typeof window !== 'undefined' && (window as any).electronAPI?.neteaseMultiSearch) {
    try {
      const res = await (window as any).electronAPI.neteaseMultiSearch({ keywords: clean, limit: 20 });
      if (res && (res.tracks?.length || res.artists?.length || res.albums?.length)) {
        return {
          tracks: res.tracks || [],
          artists: res.artists || [],
          albums: res.albums || []
        };
      }
    } catch (e) {
      logger.warn('[NETEASE]', 'Electron IPC multiSearch error, falling back:', e);
    }
  }

  // 2. Fallback: search songs
  const tracks = await searchNeteaseSongs(clean);
  return { tracks, artists: [], albums: [] };
}

export async function searchNeteaseArtists(keyword: string): Promise<NeteaseArtistItem[]> {
  const clean = keyword.trim();
  if (!clean) return [];

  logger.info('[NETEASE]', `Searching artists for keyword: "${clean}"`);

  if (typeof window !== 'undefined' && (window as any).electronAPI?.neteaseSearch) {
    try {
      const results = await (window as any).electronAPI.neteaseSearch({
        keywords: clean,
        type: 100,
        limit: 30
      });
      if (Array.isArray(results) && results.length > 0) {
        return results;
      }
    } catch (e) {
      logger.warn('[NETEASE]', 'Electron IPC artist search error:', e);
    }
  }
  return [];
}

export async function searchNeteaseAlbums(keyword: string): Promise<NeteaseAlbumItem[]> {
  const clean = keyword.trim();
  if (!clean) return [];

  logger.info('[NETEASE]', `Searching albums for keyword: "${clean}"`);

  if (typeof window !== 'undefined' && (window as any).electronAPI?.neteaseSearch) {
    try {
      const results = await (window as any).electronAPI.neteaseSearch({
        keywords: clean,
        type: 10,
        limit: 30
      });
      if (Array.isArray(results) && results.length > 0) {
        return results;
      }
    } catch (e) {
      logger.warn('[NETEASE]', 'Electron IPC album search error:', e);
    }
  }
  return [];
}

export async function searchNeteaseSongs(keyword: string): Promise<NeteaseSongItem[]> {
  if (!keyword.trim()) return [];

  logger.info('[NETEASE]', `Searching songs for keyword: "${keyword.trim()}"`);

  // 1. Try Native Electron IPC first (uses @neteasecloudmusicapienhanced/api with user cookie)
  if (typeof window !== 'undefined' && (window as any).electronAPI?.neteaseSearch) {
    try {
      const results = await (window as any).electronAPI.neteaseSearch({
        keywords: keyword.trim(),
        limit: 30
      });
      if (Array.isArray(results) && results.length > 0) {
        logger.info('[NETEASE]', `IPC search returned ${results.length} songs`);
        return results;
      }
    } catch (e) {
      logger.warn('[NETEASE]', 'Electron IPC search error, falling back:', e);
    }
  }

  // 2. Fallback to Web Suggest API
  try {
    const url = `https://music.163.com/api/search/suggest/web?s=${encodeURIComponent(keyword.trim())}`;
    const res = await fetch(url, {
      headers: {
        'Referer': 'https://music.163.com'
      }
    });
    if (res.ok) {
      const data = await res.json();
      const songs = data?.result?.songs;
      if (Array.isArray(songs)) {
        return songs.map((s: any) => {
          const artists = Array.isArray(s.artists)
            ? s.artists.map((a: any) => a.name).join(', ')
            : (s.artists?.[0]?.name || 'Unknown Artist');
          const cover = s.album?.picUrl || s.artists?.[0]?.img1v1Url || '';
          return {
            id: s.id,
            name: s.name,
            artist: artists,
            album: s.album?.name || '',
            coverUrl: cover ? cover.replace(/^http:/, 'https:') : '',
            duration: Math.round((s.duration || 0) / 1000)
          };
        });
      }
    }
  } catch (err) {
    logger.error('[NETEASE]', 'Web suggest search error', err);
  }

  return [];
}

export async function getNeteaseAudioUrl(id: number): Promise<string> {
  // 1. Try Native Electron IPC
  if (typeof window !== 'undefined' && (window as any).electronAPI?.neteaseGetAudioUrl) {
    try {
      const url = await (window as any).electronAPI.neteaseGetAudioUrl({ id });
      if (url && !url.includes('/404')) {
        logger.info('[NETEASE]', `Resolved audio URL for song ${id}`);
        return url;
      }
    } catch (e) {
      logger.warn('[NETEASE]', 'Electron IPC getAudioUrl error:', e);
    }
  }

  // 2. Fallback
  return `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
}

export async function fetchNeteaseLyrics(id: number): Promise<{
  lyrics: LyricLine[];
  hasTranslation: boolean;
}> {
  let rawOrig = '';
  let rawTrans = '';

  logger.info('[NETEASE]', `Fetching lyrics for song id: ${id}`);

  // 1. Try Native Electron IPC
  if (typeof window !== 'undefined' && (window as any).electronAPI?.neteaseGetLyric) {
    try {
      const data = await (window as any).electronAPI.neteaseGetLyric({ id });
      rawOrig = data?.lrc || '';
      rawTrans = data?.tlyric || '';
    } catch (e) {
      logger.warn('[NETEASE]', 'Electron IPC getLyric error, falling back to HTTP:', e);
    }
  }

  // 2. Fallback to HTTP
  if (!rawOrig && !rawTrans) {
    try {
      const url = `https://music.163.com/api/song/lyric?id=${id}&lv=1&kv=1&tv=-1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        rawOrig = data?.lrc?.lyric || '';
        rawTrans = data?.tlyric?.lyric || '';
      }
    } catch (err) {
      logger.error('[NETEASE]', 'HTTP lyric fetch error', err);
    }
  }

  const rawOrigLines = parseLrcContent(rawOrig);
  const transLines = parseLrcContent(rawTrans);
  const hasTranslation = transLines.length > 0;

  // Deduplicate same-timestamp lines in origLines
  // NetEase sometimes interleaves original (Chinese) + English translation at the same timestamp
  // e.g. [00:10.00]若我只是这片大地上的一道残影
  //      [00:10.00]What if I was just a shadow on the floor
  // Merge them: keep the CJK one as original, the other as referenceTranslation
  const hasCJK = (text: string) => /[\u3400-\u9FFF\uF900-\uFAFF\u{20000}-\u{2FA1F}]/u.test(text);

  const origLines: (typeof rawOrigLines[0] & { embeddedRef?: string })[] = [];
  for (let i = 0; i < rawOrigLines.length; i++) {
    const cur = rawOrigLines[i];
    const next = rawOrigLines[i + 1];

    // Check if next line shares the same timestamp (within 0.01s)
    if (next && Math.abs(next.inTime - cur.inTime) <= 0.01) {
      // Determine which is the original (CJK) and which is the translation
      const curIsCJK = hasCJK(cur.original);
      const nextIsCJK = hasCJK(next.original);

      if (curIsCJK && !nextIsCJK) {
        // Current is Chinese original, next is English reference
        origLines.push({ ...cur, embeddedRef: next.original });
        i++; // Skip next line
      } else if (!curIsCJK && nextIsCJK) {
        // Reversed: next is Chinese original, current is English reference
        origLines.push({ ...next, embeddedRef: cur.original });
        i++;
      } else {
        // Both CJK or both non-CJK — just keep first
        origLines.push(cur);
      }
    } else {
      origLines.push(cur);
    }
  }

  // Match reference translation lines by timestamp proximity
  const paired: LyricLine[] = origLines.map((line) => {
    // Priority: embedded ref from same-timestamp dedup > tlyric match
    let matchedRef = (line as any).embeddedRef || '';

    if (!matchedRef) {
      const found = transLines.find(
        (t) => Math.abs(t.inTime - line.inTime) <= 0.45
      );
      if (found && found.original) {
        matchedRef = found.original;
      }
    }

    return {
      ...line,
      referenceTranslation: matchedRef,
      translation: '', // Thai translation starts empty for user
      originalInTime: line.inTime,
      originalOutTime: line.outTime
    };
  });

  logger.info('[NETEASE]', `Parsed ${paired.length} lyric lines (has translation: ${hasTranslation})`);

  return {
    lyrics: paired,
    hasTranslation
  };
}

export const FALLBACK_ARTISTS: NeteaseArtistItem[] = [
  { id: 2116, name: '陈奕迅 (Eason Chan)', picUrl: 'https://p4.music.126.net/5KJI2mq0G0OQHQaAfAJfwg==/109951173289563385.jpg', albumSize: 133 },
  { id: 3684, name: '林俊杰 (JJ Lin)', picUrl: 'https://p4.music.126.net/78q0jUUJ0h08GxAs2G-tCA==/109951168529051968.jpg', albumSize: 98 },
  { id: 5781, name: '薛之谦 (Joker Xue)', picUrl: 'https://p3.music.126.net/Z2x6knGRr7eRrZeOlgCngA==/109951172414270313.jpg', albumSize: 85 },
  { id: 7763, name: 'G.E.M.邓紫棋', picUrl: 'https://p3.music.126.net/fq1O8ZRT5_FHzg_uLEtUQA==/109951167773880633.jpg', albumSize: 64 },
  { id: 9272, name: '孙燕姿 (Stefanie Sun)', picUrl: 'https://p3.music.126.net/VED2XoZcISpeGUTE_Q6lTA==/109951170045683199.jpg', albumSize: 52 },
  { id: 29051613, name: '郑润泽', picUrl: 'https://p4.music.126.net/BtXjoRNLCZjoSV-3Ag3M0Q==/109951164458656122.jpg', albumSize: 22 },
  { id: 5538, name: '汪苏泷 (Silence Wang)', picUrl: 'https://p4.music.126.net/YrjCHWk_OQhjlc5ycLpY3A==/109951172494696852.jpg', albumSize: 45 },
  { id: 31376161, name: '颜人中', picUrl: 'https://p4.music.126.net/M9GvSuKJQyfPKprZaLKt7A==/109951165122696427.jpg', albumSize: 18 }
];

export const FALLBACK_ALBUMS: NeteaseAlbumItem[] = [
  { id: 396397241, name: 'SKYFALL', artist: '范丞丞', picUrl: 'https://p3.music.126.net/lfU3XK7tbGs8qLl2q4aIUQ==/109951173880431320.jpg', size: 10 },
  { id: 397054641, name: 'AIMYON BEST ALBUM - 唇を追え！ -', artist: 'あいみょん', picUrl: 'https://p4.music.126.net/abicnCUja21fcG35EbNODw==/109951173899422540.jpg', size: 24 },
  { id: 395014774, name: 'あたまご', artist: '緑黄色社会', picUrl: 'https://p4.music.126.net/7mFZFKaS2VdtQvxotVjWvg==/109951173839786090.jpg', size: 12 },
  { id: 395073049, name: 'Energy', artist: 'TOYOKI', picUrl: 'https://p4.music.126.net/Th3HWiUtfmN-9mSlh2AQ3g==/109951173841975356.jpg', size: 8 },
  { id: 390514045, name: 'Made of Glass', artist: 'milet', picUrl: 'https://p4.music.126.net/Taf0eDO2_XgfA695Rta2Gg==/109951173687237170.jpg', size: 16 },
  { id: 391846443, name: '发生在闷热夏天', artist: '刘思鉴', picUrl: 'https://p4.music.126.net/q42-aVxqYwK1kCYsVVsWbA==/109951173729275424.jpg', size: 11 },
  { id: 390031118, name: 'petal', artist: 'Ariana Grande', picUrl: 'https://p4.music.126.net/eVZhj8MsxGhjbmTDVZVORQ==/109951173670280784.jpg', size: 12 },
  { id: 388196110, name: '赫鬼', artist: 'SASIOVERLXRD', picUrl: 'https://p3.music.126.net/MEx8J6j2mntRha2stE7xlA==/109951173603999384.jpg', size: 14 }
];

export async function fetchTopSongs(): Promise<NeteaseSongItem[]> {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.neteaseTopSongs) {
    try {
      const list = await (window as any).electronAPI.neteaseTopSongs();
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (e) {
      logger.warn('[NETEASE]', 'Failed to fetch top songs:', e);
    }
  }
  return searchNeteaseSongs('Wuthering Waves');
}

export async function fetchTopArtists(): Promise<NeteaseArtistItem[]> {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.neteaseTopArtists) {
    try {
      const list = await (window as any).electronAPI.neteaseTopArtists();
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (e) {
      logger.warn('[NETEASE]', 'Failed to fetch top artists:', e);
    }
  }
  return FALLBACK_ARTISTS;
}

export async function fetchNewReleases(): Promise<NeteaseAlbumItem[]> {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.neteaseNewReleases) {
    try {
      const list = await (window as any).electronAPI.neteaseNewReleases();
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (e) {
      logger.warn('[NETEASE]', 'Failed to fetch new releases:', e);
    }
  }
  return FALLBACK_ALBUMS;
}

export async function fetchTopAlbums(): Promise<NeteaseAlbumItem[]> {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.neteaseTopAlbums) {
    try {
      const list = await (window as any).electronAPI.neteaseTopAlbums();
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (e) {
      logger.warn('[NETEASE]', 'Failed to fetch top albums:', e);
    }
  }
  return FALLBACK_ALBUMS;
}

export async function fetchArtistSongs(artistId: number): Promise<NeteaseSongItem[]> {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.neteaseArtistSongs) {
    try {
      const list = await (window as any).electronAPI.neteaseArtistSongs({ id: artistId });
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (e) {
      logger.warn('[NETEASE]', `Failed to fetch artist songs for ${artistId}:`, e);
    }
  }
  return searchNeteaseSongs('Vanguard Sound');
}

export async function fetchAlbumSongs(albumId: number): Promise<NeteaseSongItem[]> {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.neteaseAlbumDetail) {
    try {
      const list = await (window as any).electronAPI.neteaseAlbumDetail({ id: albumId });
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (e) {
      logger.warn('[NETEASE]', `Failed to fetch album songs for ${albumId}:`, e);
    }
  }
  return searchNeteaseSongs('Wuthering Waves');
}
