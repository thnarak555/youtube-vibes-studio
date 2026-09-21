/**
 * Audio Quality & Format Configurations
 * Defines supported formats and transcoding policies.
 * Strictly adheres to Apple design guidelines: zero parentheses in labels.
 */

export interface AudioFormatOption {
  id: string;
  label: string;
  extension: 'mp3' | 'flac' | 'wav' | 'aac';
  bitrateKbps: number;
  isLossless: boolean;
  requiresTranscoding: boolean;
  description: string;
}

export const AUDIO_FORMAT_OPTIONS: AudioFormatOption[] = [
  {
    id: 'mp3_320',
    label: 'MP3 • 320 kbps คุณภาพสูง',
    extension: 'mp3',
    bitrateKbps: 320,
    isLossless: false,
    requiresTranscoding: false,
    description: 'ไฟล์ต้นฉบับคุณภาพสูง 320 kbps เหมาะสำหรับใช้งานทั่วไปและ After Effects'
  },
  {
    id: 'mp3_256',
    label: 'MP3 • 256 kbps มาตรฐาน',
    extension: 'mp3',
    bitrateKbps: 256,
    isLossless: false,
    requiresTranscoding: false,
    description: 'ขนาดกะทัดรัด ประหยัดพื้นที่จัดเก็บ'
  },
  {
    id: 'flac',
    label: 'FLAC • Lossless Hi-Res',
    extension: 'flac',
    bitrateKbps: 1411,
    isLossless: true,
    requiresTranscoding: true,
    description: 'รองรับเฉพาะเมื่อเพลงมี Master Lossless ในคลังเพลง'
  },
  {
    id: 'wav',
    label: 'WAV • Lossless PCM 24-bit',
    extension: 'wav',
    bitrateKbps: 1411,
    isLossless: true,
    requiresTranscoding: true,
    description: 'ไฟล์ Waveform ไม่บีบอัด สำหรับงานตัดต่อเฉพาะทาง'
  },
  {
    id: 'aac',
    label: 'AAC • M4A 320 kbps',
    extension: 'aac',
    bitrateKbps: 320,
    isLossless: false,
    requiresTranscoding: true,
    description: 'ฟอร์แมตเสียงสำหรับอุปกรณ์ Apple'
  }
];
