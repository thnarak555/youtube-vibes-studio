import type { LyricLine, SongMetadata, AEPresetColors, ProjectBackupFile } from '../types';
import { downloadFile } from './lrcExporter';

export function createProjectBackup(
  metadata: SongMetadata,
  lyrics: LyricLine[],
  aePreset: AEPresetColors,
  glowRadius: number
): ProjectBackupFile {
  return {
    version: '1.0.0',
    savedAt: new Date().toISOString(),
    metadata,
    lyrics,
    aePreset,
    glowRadius
  };
}

export function exportProjectFile(
  metadata: SongMetadata,
  lyrics: LyricLine[],
  aePreset: AEPresetColors,
  glowRadius: number
) {
  const project = createProjectBackup(metadata, lyrics, aePreset, glowRadius);
  const jsonStr = JSON.stringify(project, null, 2);
  const safeName = (metadata.title || 'LyricStudio_Project').replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadFile(jsonStr, `${safeName}.lts`, 'application/json');
}

export function parseProjectBackup(jsonStr: string): ProjectBackupFile | null {
  try {
    const data = JSON.parse(jsonStr);
    if (data && data.metadata && Array.isArray(data.lyrics)) {
      return data as ProjectBackupFile;
    }
  } catch (err) {
    console.error('Failed to parse project file:', err);
  }
  return null;
}
