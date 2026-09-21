/**
 * Centralized Application Localization & UI Text Dictionary
 * 
 * DESIGN SPECIFICATIONS:
 * 1. Apple / macOS Design Language: Minimalist, clear, concise, professional.
 * 2. Zero Parentheses: No "(" or ")" in any label, tooltip, or badge.
 * 3. AI-Friendly Documentation: Every section and key contains JSDoc annotations
 *    specifying `@file`, `@component`, and `@description` for instant discovery and editing.
 */

export const APP_TEXT = {
  /**
   * Title Bar and Window Controls
   * @file src/layouts/TitleBarLayout.tsx, src/components/layout/WindowTitleBar.tsx
   * @component TitleBarLayout, WindowTitleBar
   */
  titleBar: {
    /** @description Center document title when no song is loaded */
    untitledProject: 'โปรเจกต์ใหม่',
    /** @description Lossless audio indicator pill */
    losslessBadge: 'Lossless',
    /** @description Status when project changes are saving */
    savingStatus: 'กำลังบันทึก',
    /** @description Status when project is saved */
    savedStatus: 'บันทึกแล้ว',
    /** @description Tooltip for opening song folder in file explorer */
    openFolderTooltip: 'เปิดโฟลเดอร์เพลงในเครื่อง',
    /** @description Tooltip for user favorites and library */
    userLibraryTooltip: 'คลังเพลงและรายการโปรด',
    /** @description Tooltip for AE color styling settings */
    aeSettingsTooltip: 'ปรับแต่งสไตล์ After Effects',
    /** @description Tooltip for desktop floating lyrics toggle */
    desktopLyricsTooltip: 'เนื้อเพลงบนเดสก์ท็อป',
    /** @description Tooltip for keyboard shortcuts modal */
    shortcutsTooltip: 'คีย์ลัดระบบ',
    /** @description Tooltip for document tabs drawer toggle */
    documentTabsTooltip: 'เอกสารและโปรเจกต์',
    /** @description Minimize window button tooltip */
    minimizeWindow: 'ย่อหน้าต่าง',
    /** @description Maximize window button tooltip */
    maximizeWindow: 'ขยายหน้าต่าง',
    /** @description Restore window button tooltip */
    restoreWindow: 'ย่อขนาดหน้าต่าง',
    /** @description Close window button tooltip */
    closeWindow: 'ปิดโปรแกรม'
  },

  /**
   * Left Player Panel & Audio Scrubber
   * @file src/components/player/LeftPanel.tsx
   * @component LeftPanel
   */
  player: {
    /** @description Displayed when no song is selected */
    noSongSelected: 'ยังไม่ได้เลือกเพลง',
    /** @description Subtitle under album cover prompt */
    clickCoverToSearch: 'คลิกเพื่อค้นหาเพลงที่ต้องการ',
    /** @description Tooltip to inline-edit the song title */
    clickToEditTitle: 'คลิกเพื่อแก้ไขชื่อเพลง',
    /** @description Tooltip to play music */
    play: 'เล่นเพลง',
    /** @description Tooltip to pause music */
    pause: 'หยุดชั่วคราว',
    /** @description Seek backward 5 seconds tooltip */
    skipBack: 'ย้อนกลับ 5 วินาที',
    /** @description Seek forward 5 seconds tooltip */
    skipForward: 'ไปข้างหน้า 5 วินาที',
    /** @description Playback rate selector tooltip */
    playbackRateTooltip: 'ความเร็วการเล่น',
    /** @description Playback speed label */
    playbackSpeed: 'ความเร็วการเล่น',
    /** @description Volume slider tooltip */
    volumeTooltip: 'ระดับเสียง',
    /** @description Volume label */
    volume: 'ระดับเสียง',
    /** @description Mute audio tooltip */
    mute: 'ปิดเสียง',
    /** @description Unmute audio tooltip */
    unmute: 'เปิดเสียง',
    /** @description Add song to favorites */
    addToFavorites: 'เพิ่มในเพลงโปรด',
    /** @description Remove song from favorites */
    removeFromFavorites: 'นำออกจากเพลงโปรด',
    /** @description Toggle desktop lyrics window */
    toggleDesktopLyrics: 'เปิดหรือปิดเนื้อเพลงเดสก์ท็อป',
    /** @description Lock desktop lyrics on screen */
    lockDesktopLyrics: 'ล็อกตำแหน่งเนื้อเพลงเดสก์ท็อป',
    /** @description Unlock desktop lyrics on screen */
    unlockDesktopLyrics: 'ปลดล็อกตำแหน่งเนื้อเพลงเดสก์ท็อป',
    /** @description Desktop lyrics settings button */
    desktopLyricsSettings: 'ตั้งค่าเนื้อเพลงเดสก์ท็อป',
    /** @description Open project options menu */
    projectMenuTooltip: 'ตัวเลือกโปรเจกต์',
    /** @description Search song action button */
    searchSongAction: 'ค้นหาเพลง',
    /** @description Import lyrics action button */
    importLyricsAction: 'นำเข้าไฟล์',
    /** @description Export lyrics action button */
    exportLyricsAction: 'ส่งออกไฟล์',
    /** @description Save/backup project action button */
    backupProjectAction: 'สำรองไฟล์โปรเจกต์',
    /** @description Open backup project file action button */
    openProjectFileAction: 'เปิดไฟล์โปรเจกต์',
    /** @description Direct sync to After Effects repo */
    syncToAERepo: 'ซิงค์เข้าคลัง After Effects',
    /** @description Download audio to project folder */
    downloadAudioAction: 'ดาวน์โหลดไฟล์เสียง',
    /** @description Download album cover to project folder */
    downloadCoverAction: 'บันทึกภาพปกเพลง',
    /** @description Open project folder in explorer */
    openFolderAction: 'เปิดโฟลเดอร์โปรเจกต์',
    /** @description Previous line navigation */
    prevLine: 'ท่อนก่อนหน้า',
    /** @description Next line navigation */
    nextLine: 'ท่อนถัดไป',
    /** @description Loop line toggle */
    loopLine: 'วนซ้ำเฉพาะท่อนนี้',
    /** @description Unloop line toggle */
    unloopLine: 'ยกเลิกการวนซ้ำ'
  },

  /**
   * Navigation links & Action triggers
   */
  navigation: {
    searchSongs: 'ค้นหาเพลง',
    importLyrics: 'นำเข้าเนื้อเพลง',
    exportFiles: 'ส่งออกไฟล์',
    documentTabs: 'เอกสารและโปรเจกต์',
    keyboardShortcuts: 'คีย์ลัดระบบ',
    settings: 'ตั้งค่าระบบ',
    aeColorSettings: 'ปรับแต่งสไตล์ After Effects',
    desktopLyrics: 'เนื้อเพลงบนเดสก์ท็อป',
    openFolder: 'เปิดโฟลเดอร์โปรเจกต์',
    revealInExplorer: 'เปิดตำแหน่งในเครื่อง'
  },

  /**
   * 3 Display Modes
   */
  modes: {
    normal: 'ปกติ',
    fade: 'เฟด',
    document: 'เอกสาร',
    normalTooltip: 'แสดงเนื้อเพลงเลื่อนตามไทม์ไลน์เสียง',
    fadeTooltip: 'แสดงเฉพาะท่อนปัจจุบันแบบเฟดภาพนุ่มนวล',
    documentTooltip: 'เปิดดูและแก้ไขเนื้อเพลงทั้งสองภาษาพร้อมกันทั้งหมด'
  },

  /**
   * Lyrics Studio Top Toolbar
   * @file src/components/lyrics/RightLyricsPanel.tsx
   * @component RightLyricsPanel
   */
  lyricsToolbar: {
    /** @description Segmented control: Normal timeline view */
    modeNormal: 'ปกติ',
    /** @description Segmented control: Smooth fade view */
    modeFade: 'เฟด',
    /** @description Segmented control: Full document view */
    modeDocument: 'เอกสาร',
    /** @description Tooltip for normal mode */
    modeNormalTooltip: 'แสดงเนื้อเพลงเลื่อนตามไทม์ไลน์เสียง',
    /** @description Tooltip for fade mode */
    modeFadeTooltip: 'แสดงเฉพาะท่อนปัจจุบันแบบเฟดภาพนุ่มนวล',
    /** @description Tooltip for document mode */
    modeDocumentTooltip: 'เปิดดูและแก้ไขเนื้อเพลงทั้งสองภาษาพร้อมกันทั้งหมด',
    /** @description Undo action button */
    undo: 'เลิกทำ',
    /** @description Redo action button */
    redo: 'ทำซ้ำ',
    /** @description Search input placeholder */
    searchPlaceholder: 'ค้นหาในเนื้อเพลง',
    /** @description Search button label */
    searchButton: 'ค้นหา',
    /** @description Close search bar */
    closeSearch: 'ปิดการค้นหา',
    /** @description Previous search result */
    prevResult: 'ก่อนหน้า',
    /** @description Next search result */
    nextResult: 'ถัดไป',
    /** @description Swap original and reference language */
    swapLanguages: 'สลับภาษา',
    /** @description Copy reference lyrics into Thai translation column */
    pullReference: 'ดึงคำแปล',
    /** @description Toggle translation editing mode */
    translateMode: 'โหมดแปล',
    /** @description Open full lyrics editor modal */
    fullEditor: 'แก้ไขเต็มจอ',
    /** @description Empty state title when no lyrics are loaded */
    noLyricsTitle: 'ยังไม่มีเนื้อเพลงในห้องแปล',
    /** @description Empty state description */
    noLyricsDesc: 'สามารถค้นหาเพลง นำเข้าไฟล์ หรือพิมพ์เนื้อเพลงเพื่อเริ่มต้นแปลได้ทันที',
    /** @description Button to initiate search in empty state */
    startSearch: 'ค้นหาเพลง'
  },

  /**
   * Lyrics Timeline Editor Rows
   * @file src/components/lyrics/RightLyricsPanel.tsx, src/components/lyrics/LyricTranslationRow.tsx
   * @component RightLyricsPanel, LyricTranslationRow
   */
  lyrics: {
    noLyricsTitle: 'ยังไม่มีเนื้อเพลงในห้องแปล',
    noLyricsDesc: 'สามารถค้นหาเพลง นำเข้าไฟล์ หรือพิมพ์เนื้อเพลงเพื่อเริ่มต้นแปลได้ทันที',
    originalLyric: 'เนื้อร้องต้นฉบับ',
    referenceTranslation: 'คำแปลอ้างอิง',
    targetTranslation: 'คำแปลภาษาไทย',
    translationPlaceholder: 'พิมพ์คำแปลภาษาไทยที่นี่...',
    originalPlaceholder: 'พิมพ์เนื้อร้องต้นฉบับ...',
    searchInLyrics: 'ค้นหาคำในเนื้อเพลง',
    swapLanguages: 'สลับภาษา',
    copyReferenceToTranslation: 'ดึงคำแปลอ้างอิง',
    resetToOriginalTime: 'รีเซ็ตเป็นเวลาต้นฉบับ',
    timecodeIn: 'เวลาเริ่มต้น',
    timecodeOut: 'เวลาสิ้นสุด',
    nudgeMinus: 'ลดเวลา 0.1 วินาที',
    nudgePlus: 'เพิ่มเวลา 0.1 วินาที',
    stampCurrentTime: 'ใช้เวลาปัจจุบัน',
    splitLine: 'ตัดแบ่งท่อนนี้',
    mergeLine: 'รวมกับท่อนถัดไป',
    deleteLine: 'ลบท่อนนี้',
    addLine: 'เพิ่มท่อนใหม่',
    undo: 'เลิกทำ',
    redo: 'ทำซ้ำ'
  },

  lyricsTimeline: {
    originalHeader: 'เนื้อร้องต้นฉบับ',
    translationHeader: 'คำแปลภาษาไทย',
    referenceHeader: 'คำแปลอ้างอิง',
    originalPlaceholder: 'พิมพ์เนื้อร้องต้นฉบับ',
    translationPlaceholder: 'พิมพ์คำแปลภาษาไทย',
    playLine: 'เล่นจากท่อนนี้',
    stampInTime: 'ตั้งเวลาเริ่ม',
    stampOutTime: 'ตั้งเวลาจบ',
    nudgeInMinus: 'ลดเวลาเริ่ม 0.1 วินาที',
    nudgeInPlus: 'เพิ่มเวลาเริ่ม 0.1 วินาที',
    nudgeOutMinus: 'ลดเวลาจบ 0.1 วินาที',
    nudgeOutPlus: 'เพิ่มเวลาจบ 0.1 วินาที',
    splitLine: 'ตัดแบ่งท่อน',
    mergeLine: 'รวมกับท่อนถัดไป',
    deleteLine: 'ลบท่อนนี้',
    insertLine: 'เพิ่มท่อนใหม่'
  },

  /**
   * Full Lyrics Modal Editor
   * @file src/components/lyrics/FullLyricsModal.tsx
   * @component FullLyricsModal
   */
  lyricsFull: {
    title: 'แก้ไขเนื้อเพลงและคำแปลแบบรวมศูนย์',
    close: 'ปิด',
    saveAndSync: 'บันทึกการเปลี่ยนแปลง',
    linesCount: 'บรรทัด',
    originalColumn: 'เนื้อร้องต้นฉบับ',
    translationColumn: 'คำแปลภาษาไทย',
    referenceColumn: 'คำแปลอ้างอิง'
  },

  /**
   * Document Tabs and Project Management Sidebar
   * @file src/components/layout/DocumentTabsSidebar.tsx
   * @component DocumentTabsSidebar
   */
  documentTabs: {
    title: 'เอกสารและโปรเจกต์',
    openTabsHeader: 'แท็บที่เปิดอยู่',
    diskProjectsHeader: 'โปรเจกต์ในเครื่อง',
    newTab: 'สร้างโปรเจกต์ใหม่',
    untitledSong: 'โปรเจกต์ใหม่',
    unknownArtist: 'ไม่ระบุศิลปิน',
    savedOnDisk: 'บันทึกในเครื่อง',
    closeTab: 'ปิดแท็บนี้',
    renameProject: 'เปลี่ยนชื่อโปรเจกต์',
    duplicateProject: 'ทำสำเนาโปรเจกต์',
    openFolder: 'เปิดโฟลเดอร์',
    switchConfirmTitle: 'ต้องการสลับโปรเจกต์หรือไม่',
    switchConfirmMessage: 'ระบบจะบันทึกโปรเจกต์ปัจจุบันก่อนสลับไปยังโปรเจกต์ใหม่ เพื่อความปลอดภัยของข้อมูล',
    confirmSwitch: 'สลับโปรเจกต์',
    cancel: 'ยกเลิก'
  },

  documentPanel: {
    title: 'เอกสารและโปรเจกต์',
    openTabsHeader: 'แท็บที่เปิดอยู่',
    diskProjectsHeader: 'โปรเจกต์ในเครื่อง',
    newTab: 'สร้างโปรเจกต์ใหม่',
    closeTab: 'ปิดแท็บนี้',
    renameProject: 'เปลี่ยนชื่อโปรเจกต์',
    duplicateProject: 'ทำสำเนาโปรเจกต์',
    exportProject: 'ส่งออกไฟล์โปรเจกต์',
    pinToFavorites: 'ปักหมุดรายการโปรด',
    switchConfirmTitle: 'ต้องการสลับโปรเจกต์หรือไม่',
    switchConfirmMessage: 'ระบบจะบันทึกโปรเจกต์ปัจจุบันก่อนสลับไปยังโปรเจกต์ใหม่ เพื่อความปลอดภัยของข้อมูล',
    confirmSwitch: 'สลับโปรเจกต์',
    cancel: 'ยกเลิก'
  },

  /**
   * Search Song Modal
   * @file src/components/player/SearchSongModal.tsx
   * @component SearchSongModal
   */
  searchModal: {
    title: 'ค้นหาเพลงในระบบ',
    placeholder: 'พิมพ์ชื่อเพลง ศิลปิน หรืออัลบั้ม',
    searchPlaceholder: 'พิมพ์ชื่อเพลง ศิลปิน หรืออัลบั้ม',
    searchButton: 'ค้นหา',
    searching: 'กำลังค้นหาเพลงในระบบ',
    noResults: 'ไม่พบเพลงที่ค้นหา ลองค้นหาด้วยคำอื่น',
    emptyPrompt: 'พิมพ์ชื่อเพลงเพื่อเริ่มต้นค้นหาจากคลังเพลงสากล',
    openInStudio: 'เปิดในสตูดิโอ',
    loadingSong: 'กำลังโหลดข้อมูล',
    tabs: {
      recommendations: 'เพลงแนะนำ',
      artists: 'ศิลปิน',
      topSongs: 'เพลงยอดนิยม',
      latestReleases: 'เพลงใหม่ล่าสุด',
      albums: 'อัลบั้ม'
    }
  },

  /**
   * Import Lyrics Modal
   * @file src/components/lyrics/ImportModal.tsx
   * @component ImportModal
   */
  importModal: {
    title: 'นำเข้าเนื้อเพลง',
    subtitle: 'รองรับไฟล์ LRC, SRT หรือวางข้อความเนื้อเพลงโดยตรง',
    tabFile: 'อัปโหลดไฟล์',
    tabText: 'วางข้อความ',
    dragDropPrompt: 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์',
    pastePlaceholder: 'วางเนื้อเพลงพร้อมเวลา หรือเนื้อเพลงเปล่าที่นี่',
    importButton: 'นำเข้าเนื้อเพลง',
    cancel: 'ยกเลิก'
  },

  /**
   * Export Files Modal & Code Preview
   * @file src/components/export/ExportModal.tsx, src/components/preview/ModernCodePreview.tsx
   * @component ExportModal, ModernCodePreview
   */
  exportModal: {
    title: 'ส่งออกไฟล์และซิงค์ข้อมูล',
    quickCopy: 'คัดลอกด่วน',
    copyBilingual: 'คัดลอกสองภาษา',
    copyThaiOnly: 'คัดลอกเฉพาะภาษาไทย',
    copyOriginalOnly: 'คัดลอกเฉพาะต้นฉบับ',
    copyCode: 'คัดลอกโค้ดนี้',
    copiedSuccess: 'คัดลอกแล้ว',
    downloadFile: 'ดาวน์โหลดไฟล์',
    syncToAERepo: 'ซิงค์เข้าคลัง After Effects',
    syncSuccess: 'ซิงค์ไฟล์เข้าคลัง After Effects เรียบร้อยแล้ว',
    syncError: 'ไม่สามารถซิงค์ไฟล์ได้',
    downloadAudio: 'โหลดเสียง',
    downloadCover: 'ภาพปก',
    audioQualityFlac: 'FLAC • สูงสุด Lossless',
    audioQualityMp3_320: 'MP3 • 320 kbps คุณภาพสูง',
    audioQualityMp3_192: 'MP3 • 192 kbps มาตรฐาน',
    audioQualityM4a: 'M4A • 128 kbps ขนาดกะทัดรัด',
    formats: {
      aeJsx: {
        label: 'After Effects Universal',
        desc: 'สคริปต์สากล รันในคลังสคริปต์หรือรันตรงใน AE ได้ทันที'
      },
      lrcBi: {
        label: 'LRC สองภาษา',
        desc: 'เนื้อร้องต้นฉบับพร้อมคำแปลภาษาไทย'
      },
      lrcTh: {
        label: 'LRC ภาษาไทย',
        desc: 'เฉพาะคำแปลภาษาไทยพร้อมเวลา'
      },
      lrcEn: {
        label: 'LRC ต้นฉบับ',
        desc: 'เฉพาะเนื้อร้องต้นฉบับพร้อมเวลา'
      },
      lrcRef: {
        label: 'LRC คำแปลอ้างอิง',
        desc: 'คำแปลอ้างอิงจากแหล่งต้นทาง'
      },
      srt: {
        label: 'SRT Subtitles',
        desc: 'ซับไตเติลสำหรับโปรแกรมตัดต่อวิดีโอ'
      }
    },
    openFolder: 'เปิดโฟลเดอร์โปรเจกต์',
    close: 'ปิด'
  },

  /**
   * Desktop Lyrics Overlay & Settings Modal
   * @file src/components/desktop-lyrics/DesktopLyricsOverlay.tsx, src/components/desktop-lyrics/DesktopLyricsSettingsModal.tsx
   * @component DesktopLyricsOverlay, DesktopLyricsSettingsModal
   */
  desktopLyrics: {
    title: 'เนื้อเพลงบนเดสก์ท็อป',
    subtitle: 'ปรับแต่งการแสดงผล การล็อกหน้าต่าง และสีสันตามต้องการ',
    lockWindow: 'ล็อกตำแหน่งหน้าต่าง',
    unlockWindow: 'ปลดล็อกตำแหน่งหน้าต่าง',
    settings: 'ตั้งค่าเนื้อเพลง',
    fadeEffect: 'เอฟเฟกต์เฟดนุ่มนวล',
    fadeToggle: 'เอฟเฟกต์เฟดนุ่มนวล',
    fontSize: 'ขนาดตัวอักษร',
    textColor: 'สีข้อความ',
    activeColor: 'สีไฮไลต์ท่อนที่กำลังเล่น',
    bgOpacity: 'ความโปร่งแสงพื้นหลัง',
    resetDefaults: 'รีเซ็ตค่าเริ่มต้น',
    close: 'ปิด'
  },

  /**
   * After Effects Color & Preset Settings Modal
   * @file src/components/export/AESettingsModal.tsx
   * @component AESettingsModal
   */
  aeSettings: {
    title: 'ปรับแต่งสไตล์ After Effects',
    subtitle: 'ตั้งค่าสีไล่ระดับและรัศมีการเรืองแสงสำหรับสคริปต์อัตโนมัติ',
    startColor: 'สีเริ่มต้น',
    endColor: 'สีสิ้นสุด',
    glowRadius: 'รัศมีการเรืองแสง',
    presetLabel: 'พรีเซ็ตสีแนะนำ',
    close: 'บันทึกและปิด'
  },

  /**
   * User Library and Favorites Modal
   * @file src/components/player/UserLibraryModal.tsx
   * @component UserLibraryModal
   */
  userLibrary: {
    title: 'คลังเพลงและรายการโปรด',
    tabFavorites: 'เพลงโปรด',
    tabHistory: 'ประวัติการเปิด',
    emptyFavorites: 'ยังไม่มีเพลงในรายการโปรด สามารถกดไอคอนหัวใจที่เพลงเพื่อบันทึกไว้ที่นี่',
    openSong: 'เปิดเพลงนี้',
    close: 'ปิด'
  },

  /**
   * Keyboard Shortcuts Modal
   * @file src/components/layout/ShortcutsModal.tsx
   * @component ShortcutsModal
   */
  shortcuts: {
    title: 'คีย์ลัดระบบ',
    subtitle: 'แป้นพิมพ์ลัดเพื่อการทำงานที่รวดเร็ว',
    space: 'เล่น หรือ หยุดชั่วคราว',
    seek: 'ย้อนหลัง หรือ ไปข้างหน้า 5 วินาที',
    volume: 'เพิ่ม หรือ ลดระดับเสียง',
    undo: 'เลิกทำ',
    redo: 'ทำซ้ำ',
    search: 'ค้นหาในเนื้อเพลง',
    desktopLyrics: 'เปิดหรือปิดเนื้อเพลงบนเดสก์ท็อป',
    close: 'ปิด'
  },

  /**
   * Global Messages & Notifications
   */
  messages: {
    saved: 'บันทึกแล้ว',
    saving: 'กำลังบันทึก...',
    projectLoaded: 'เปิดโปรเจกต์เรียบร้อย',
    downloadedAudio: 'บันทึกไฟล์เสียงสำเร็จ',
    downloadedCover: 'บันทึกภาพปกสำเร็จ',
    audioTranscodeNotice: 'ไฟล์ต้นทางเป็น MP3 คุณภาพสูง ระบบจะบันทึกไฟล์คุณภาพสูงสุดจากต้นฉบับ',
    folderOpened: 'เปิดโฟลเดอร์ในระบบแล้ว',
    folderNotFound: 'ยังไม่พบโฟลเดอร์สำหรับเพลงนี้ ระบบจะสร้างขึ้นอัตโนมัติเมื่อบันทึก'
  },

  /**
   * Global Toast and Feedback Notifications
   * @file Used throughout the application
   */
  toast: {
    saved: 'บันทึกเรียบร้อย',
    saving: 'กำลังบันทึก',
    projectLoaded: 'เปิดโปรเจกต์เรียบร้อย',
    downloadedAudio: 'บันทึกไฟล์เสียงสำเร็จ',
    downloadedCover: 'บันทึกภาพปกสำเร็จ',
    folderOpened: 'เปิดโฟลเดอร์ในระบบแล้ว',
    folderNotFound: 'ยังไม่พบโฟลเดอร์สำหรับเพลงนี้ ระบบจะสร้างขึ้นอัตโนมัติเมื่อบันทึก',
    copied: 'คัดลอกเรียบร้อย',
    desktopOnlyFeature: 'ฟีเจอร์นี้ใช้งานได้บนโหมด Desktop'
  }
} as const;

/**
 * Backward compatibility alias for existing code
 */
export const THAI_TEXT = APP_TEXT;
