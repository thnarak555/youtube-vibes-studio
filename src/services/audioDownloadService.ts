/**
 * Audio Download & Routing Service
 * Handles saving files into the song's dedicated project folder
 * and validates audio format integrity.
 */

import { sanitizeSafeFilename } from '../utils/lrcExporter';
import { logger } from './logger';
import { THAI_TEXT } from '../constants/localization';
import type { SongMetadata } from '../types';

export interface AudioDownloadResult {
  success: boolean;
  message: string;
  filePath?: string;
  isFormatAdjusted?: boolean;
}

export async function downloadSongAudio(
  metadata: SongMetadata,
  formatId: string,
  savedDiskPath?: string | null
): Promise<AudioDownloadResult> {
  if (!metadata.audioSrc) {
    return {
      success: false,
      message: 'ไม่พบไฟล์เสียงในโปรเจกต์'
    };
  }

  const safeTitle = sanitizeSafeFilename(metadata.title || 'Song');
  const safeArtist = sanitizeSafeFilename(metadata.artist || 'Artist');
  const targetFolder = savedDiskPath || undefined;

  // Determine intended extension
  let targetExtension = 'mp3';
  let isFormatAdjusted = false;
  let noticeMsg = '';

  if (formatId === 'flac' || formatId === 'wav' || formatId === 'aac') {
    // If audioSrc is an mp3 stream from NetEase CDN
    if (metadata.audioSrc.includes('.mp3') || metadata.audioSrc.includes('/media/outer/')) {
      targetExtension = 'mp3';
      isFormatAdjusted = true;
      noticeMsg = THAI_TEXT.messages.audioTranscodeNotice;
    } else {
      targetExtension = formatId;
    }
  }

  const fileName = `${safeArtist} - ${safeTitle}.${targetExtension}`;

  logger.info('[AUDIO_DOWNLOAD]', `Downloading audio as ${fileName} to folder: ${targetFolder || 'default'}`);

  if (typeof window !== 'undefined' && (window as any).electronAPI?.downloadAudioFile) {
    try {
      const res = await (window as any).electronAPI.downloadAudioFile({
        url: metadata.audioSrc,
        fileName,
        customDir: targetFolder
      });

      if (res?.success) {
        return {
          success: true,
          message: isFormatAdjusted ? noticeMsg : THAI_TEXT.messages.downloadedAudio,
          filePath: res.filePath,
          isFormatAdjusted
        };
      } else {
        return {
          success: false,
          message: res?.error || 'ดาวน์โหลดไฟล์เสียงล้มเหลว'
        };
      }
    } catch (err: any) {
      logger.error('[AUDIO_DOWNLOAD]', 'Electron audio download error', err);
      return {
        success: false,
        message: err?.message || 'เกิดข้อผิดพลาดในการดาวน์โหลด'
      };
    }
  } else {
    // Browser fallback
    window.open(metadata.audioSrc, '_blank');
    return {
      success: true,
      message: 'เปิดลิงก์ดาวน์โหลดในเบราว์เซอร์แล้ว'
    };
  }
}
