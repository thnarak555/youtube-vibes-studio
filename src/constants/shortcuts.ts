/**
 * Keyboard Shortcuts Configuration
 * Centralized registry for all global and editor shortcuts.
 */

export interface ShortcutDefinition {
  key: string;
  description: string;
  category: 'playback' | 'editing' | 'navigation';
}

export const SHORTCUTS: Record<string, ShortcutDefinition> = {
  PLAY_PAUSE: {
    key: 'Space',
    description: 'เล่น / หยุดเพลงชั่วคราว',
    category: 'playback'
  },
  UNDO: {
    key: 'Ctrl + Z',
    description: 'เลิกทำการแก้ไขล่าสุด',
    category: 'editing'
  },
  REDO: {
    key: 'Ctrl + Y หรือ Ctrl + Shift + Z',
    description: 'ทำซ้ำการแก้ไขล่าสุด',
    category: 'editing'
  },
  PREV_LINE: {
    key: 'ArrowLeft',
    description: 'ย้อนกลับไปท่อนก่อนหน้า',
    category: 'navigation'
  },
  NEXT_LINE: {
    key: 'ArrowRight',
    description: 'ไปยังท่อนถัดไป',
    category: 'navigation'
  },
  LOOP_LINE: {
    key: 'R',
    description: 'เปิด / ปิดการวนซ้ำเฉพาะท่อนปัจจุบัน',
    category: 'playback'
  },
  NUDGE_BACK: {
    key: '[',
    description: 'ถอยหลัง 2 วินาที',
    category: 'playback'
  },
  NUDGE_FORWARD: {
    key: ']',
    description: 'เดินหน้า 2 วินาที',
    category: 'playback'
  },
  SEARCH_LYRICS: {
    key: 'Ctrl + F',
    description: 'ค้นหาคำในเนื้อเพลง',
    category: 'navigation'
  },
  CLOSE_MODAL: {
    key: 'Escape',
    description: 'ปิดหน้าต่างป๊อปอัป',
    category: 'navigation'
  }
};
