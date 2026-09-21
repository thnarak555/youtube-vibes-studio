import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Plus, 
  FileText, 
  FolderOpen, 
  Trash2, 
  MoreVertical, 
  Music,
  Check,
  Edit2,
  Copy,
  Download,
  Heart
} from 'lucide-react';
import { useLyricStore } from '../../stores/useLyricStore';
import { playTapSound, playDeleteSound, playSuccessSound } from '../../utils/soundEffects';
import { APP_TEXT, THAI_TEXT } from '../../constants/localization';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { exportProjectFile } from '../../utils/projectManager';
import { logger } from '../../services/logger';
import { cn } from '../../utils/cn';
import { APPLE_THEME, sanitizeAppleTitle } from '../../theme/theme';
import type { DocumentTab } from '../../stores/useLyricStore';

interface DocumentTabsSidebarProps {
  onOpenSearch: () => void;
  onSwitchProjectAudio: (audioSrc?: string) => void;
}

/**
 * Apple-style Document Tabs Drawer
 * Fixes layout bugs:
 * - Positioned cleanly below top title bar (top-9 bottom-0)
 * - Backdrop scrim for dismiss on outside click
 * - Strips parentheses from song titles
 * - 100% functional 3-dot menu with roadmap actions
 */
export const DocumentTabsSidebar: React.FC<DocumentTabsSidebarProps> = ({ 
  onOpenSearch, 
  onSwitchProjectAudio 
}) => {
  const { 
    openTabs, 
    activeTabId, 
    isTabsDrawerOpen, 
    setTabsDrawerOpen, 
    openTab, 
    closeTab, 
    createNewTab,
    openProjectDiskFolder,
    metadata,
    lyrics,
    aePreset,
    glowRadius,
    toggleFavoriteCurrentSong,
    setMetadata
  } = useLyricStore();

  const [diskProjects, setDiskProjects] = useState<any[]>([]);
  const [activeMenuTabId, setActiveMenuTabId] = useState<string | null>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editTitleVal, setEditTitleVal] = useState('');
  
  // Project Switch Confirmation Dialog state
  const [pendingSwitchTarget, setPendingSwitchTarget] = useState<{ tab: DocumentTab; data?: any } | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Load projects from disk workspace
  useEffect(() => {
    if (!isTabsDrawerOpen) return;
    const fetchDiskProjects = async () => {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.listDiskProjects) {
        try {
          const list = await (window as any).electronAPI.listDiskProjects();
          setDiskProjects(list || []);
        } catch (e) {
          logger.warn('[DOC_PANEL]', 'Failed to list disk projects:', e);
        }
      }
    };
    fetchDiskProjects();
  }, [isTabsDrawerOpen]);

  // Click outside listener for item menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuTabId(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handles safe project switching with confirmation
  const handleTabClick = (tab: DocumentTab, data?: any) => {
    if (tab.id === activeTabId) return;
    playTapSound();
    setPendingSwitchTarget({ tab, data });
  };

  const confirmProjectSwitch = () => {
    if (!pendingSwitchTarget) return;
    const { tab, data } = pendingSwitchTarget;
    logger.info('[DOC_PANEL]', `Switching to project: ${tab.title} (${tab.id})`);
    
    // Switch tab in store
    openTab(tab, data);
    
    // Switch audio engine cleanly
    const targetMeta = data?.metadata || tab.metadata;
    const nextAudioSrc = targetMeta?.audioSrc || (tab.title === metadata.title ? metadata.audioSrc : '');
    onSwitchProjectAudio(nextAudioSrc);

    playSuccessSound();
    setPendingSwitchTarget(null);
  };

  // 1. Rename Project
  const handleStartRename = (tab: DocumentTab) => {
    setEditingTabId(tab.id);
    setEditTitleVal(tab.title);
    setActiveMenuTabId(null);
  };

  const handleSaveRename = (tabId: string) => {
    if (editTitleVal.trim()) {
      if (tabId === activeTabId) {
        setMetadata({ title: editTitleVal.trim() });
      } else {
        const { openTabs } = useLyricStore.getState();
        const updated = openTabs.map(t => t.id === tabId ? { ...t, title: editTitleVal.trim() } : t);
        useLyricStore.setState({ openTabs: updated });
      }
    }
    setEditingTabId(null);
  };

  // 2. Duplicate Project
  const handleDuplicateTab = (tab: DocumentTab) => {
    setActiveMenuTabId(null);
    playTapSound();
    const newId = 'tab-' + Date.now().toString(36);
    const newTab: DocumentTab = {
      ...tab,
      id: newId,
      title: `${tab.title} • สำเนา`
    };
    const { openTabs } = useLyricStore.getState();
    useLyricStore.setState({ openTabs: [...openTabs, newTab] });
    logger.info('[DOC_PANEL]', `Duplicated project: ${tab.title} to ${newTab.title}`);
  };

  // 3. Export Project Files
  const handleExportProject = (_tab: DocumentTab) => {
    setActiveMenuTabId(null);
    playTapSound();
    exportProjectFile(metadata, lyrics, aePreset, glowRadius);
  };

  return (
    <AnimatePresence>
      {isTabsDrawerOpen && (
        <>
          {/* Backdrop Scrim - Clean click-outside dismiss without blocking titlebar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={APPLE_THEME.transitions.fast}
            onClick={() => {
              playTapSound();
              setTabsDrawerOpen(false);
            }}
            className="fixed inset-0 top-10 sm:top-11 bg-black/50 backdrop-blur-xs z-30"
          />

          {/* Apple-style Liquid Glass Drawer */}
          <motion.aside
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-10 sm:top-11 bottom-0 right-0 z-40 w-72 sm:w-84 bg-[#0c0d15]/85 backdrop-blur-3xl border-l border-white/15 shadow-[-25px_0_60px_rgba(0,0,0,0.85)] flex flex-col select-none overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/[0.08] flex-shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playTapSound();
                    setTabsDrawerOpen(false);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
                  title="ปิดแถบเอกสาร"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <h2 className="text-xs font-semibold text-white tracking-wide uppercase">
                  {THAI_TEXT.documentPanel.title}
                </h2>
              </div>

          <button
            onClick={() => {
              playTapSound();
              createNewTab();
              onOpenSearch();
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
            title={THAI_TEXT.documentPanel.newTab}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Tabs List */}
        <div className="flex-1 overflow-y-auto scrollbar-dark p-2.5 space-y-1.5">
          <div className="px-2 py-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
            {THAI_TEXT.documentPanel.openTabsHeader} • {openTabs.length}
          </div>

          {openTabs.map((tab, idx) => {
            const isActive = tab.id === activeTabId;
            const isEditing = editingTabId === tab.id;
            const sanitizedTitle = sanitizeAppleTitle(tab.title || `เอกสาร ${idx + 1}`);
            const sanitizedArtist = sanitizeAppleTitle(tab.artist || 'ยังไม่มีข้อมูลศิลปิน');

            return (
              <div
                key={tab.id}
                onClick={() => !isEditing && handleTabClick(tab)}
                className={cn(
                  "group relative flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer border",
                  isActive
                    ? `bg-white/[0.12] border-white/[0.18] text-white shadow-lg ${APPLE_THEME.specular.top}`
                    : "bg-white/[0.03] border-white/[0.05] text-white/70 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.1]"
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {tab.coverUrl ? (
                    <img
                      src={tab.coverUrl}
                      alt=""
                      className="w-9 h-9 rounded-xl object-cover border border-white/10 flex-shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitleVal}
                        onChange={(e) => setEditTitleVal(e.target.value)}
                        onBlur={() => handleSaveRename(tab.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(tab.id)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-white/15 text-white text-xs px-2 py-1 rounded-lg border border-white/30 outline-none"
                      />
                    ) : (
                      <>
                        <p className="text-xs font-semibold truncate text-white/90 group-hover:text-white">
                          {sanitizedTitle}
                        </p>
                        <p className="text-[10px] text-white/45 truncate mt-0.5">
                          {sanitizedArtist}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* 3-dots Context Menu with Roadmap Features */}
                <div className="relative flex items-center ml-1" ref={activeMenuTabId === tab.id ? menuRef : null}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTapSound();
                      setActiveMenuTabId(activeMenuTabId === tab.id ? null : tab.id);
                    }}
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                    title="ตัวเลือกโปรเจกต์"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  <AnimatePresence>
                    {activeMenuTabId === tab.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.94, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: -4 }}
                        transition={APPLE_THEME.springs.snappy}
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute right-0 top-7 w-48 rounded-2xl bg-[#12131e]/95 backdrop-blur-2xl border border-white/[0.12] p-1.5 z-50 shadow-[0_16px_40px_rgba(0,0,0,0.65)] flex flex-col gap-0.5 text-xs text-white ${APPLE_THEME.specular.top}`}
                      >
                        {/* 1. Rename */}
                        <button
                          onClick={() => handleStartRename(tab)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-white/70" />
                          <span>{THAI_TEXT.documentPanel.renameProject}</span>
                        </button>

                        {/* 2. Duplicate */}
                        <button
                          onClick={() => handleDuplicateTab(tab)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-white/70" />
                          <span>{THAI_TEXT.documentPanel.duplicateProject}</span>
                        </button>

                        {/* 3. Export Project */}
                        <button
                          onClick={() => handleExportProject(tab)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-white/70" />
                          <span>{THAI_TEXT.documentPanel.exportProject}</span>
                        </button>

                        {/* 4. Open Folder */}
                        <button
                          onClick={() => {
                            playTapSound();
                            openProjectDiskFolder();
                            setActiveMenuTabId(null);
                          }}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-white/70" />
                          <span>{THAI_TEXT.navigation.revealInExplorer}</span>
                        </button>

                        {/* 5. Pin to Favorites */}
                        <button
                          onClick={() => {
                            playTapSound();
                            toggleFavoriteCurrentSong();
                            setActiveMenuTabId(null);
                          }}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5 text-white/70" />
                          <span>{THAI_TEXT.documentPanel.pinToFavorites}</span>
                        </button>

                        <div className="my-1 border-t border-white/[0.08]" />

                        {/* 6. Close Tab */}
                        <button
                          onClick={() => {
                            playDeleteSound();
                            closeTab(tab.id);
                            setActiveMenuTabId(null);
                          }}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-red-500/20 text-red-400 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{THAI_TEXT.documentPanel.closeTab}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}

          {/* Saved Workspace Projects from Disk */}
          {diskProjects.length > 0 && (
            <div className="pt-3 space-y-1.5">
              <div className="px-2 py-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                {THAI_TEXT.documentPanel.diskProjectsHeader} • {diskProjects.length}
              </div>

              {diskProjects.map((p) => {
                const title = p.metadata?.title || p.folderName;
                const artist = p.metadata?.artist || APP_TEXT.documentTabs.unknownArtist;
                const coverUrl = p.metadata?.coverUrl || '';
                const isOpen = openTabs.some(t => t.title === title);
                const sanitizedPTitle = sanitizeAppleTitle(title);
                const sanitizedPArtist = sanitizeAppleTitle(artist);

                return (
                  <div
                    key={p.folderName}
                    onClick={() => {
                      if (p.data) {
                        handleTabClick({
                          id: 'tab-' + p.folderName,
                          title: title,
                          artist: artist,
                          coverUrl: coverUrl,
                          folderPath: p.folderPath,
                          lastSavedAt: APP_TEXT.documentTabs.savedOnDisk
                        }, p.data);
                      }
                    }}
                    className="group flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer bg-white/[0.015] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt=""
                          className="w-7 h-7 rounded-lg object-cover border border-white/10 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 flex-shrink-0">
                          <Music className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-white/70 group-hover:text-white truncate">
                          {sanitizedPTitle}
                        </p>
                        <p className="text-[10px] text-white/30 truncate">
                          {sanitizedPArtist}
                        </p>
                      </div>
                    </div>

                    {isOpen && (
                      <Check className="w-3 h-3 text-emerald-400 mr-1" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.aside>

      {/* Confirmation Dialog on Project Switch */}
      <ConfirmDialog
        isOpen={!!pendingSwitchTarget}
        title={THAI_TEXT.documentPanel.switchConfirmTitle}
        message={THAI_TEXT.documentPanel.switchConfirmMessage}
        confirmLabel={THAI_TEXT.documentPanel.confirmSwitch}
        cancelLabel={THAI_TEXT.documentPanel.cancel}
        onConfirm={confirmProjectSwitch}
        onCancel={() => setPendingSwitchTarget(null)}
      />
        </>
      )}
    </AnimatePresence>
  );
};
