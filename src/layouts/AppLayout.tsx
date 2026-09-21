import React from 'react';

export interface AppLayoutProps {
  titleBar: React.ReactNode;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  sidebar?: React.ReactNode;
  modals?: React.ReactNode;
  leftWidth: number;
  isResizing: boolean;
  onStartResizing: (e: React.MouseEvent) => void;
}

/**
 * Apple-style Application Layout Shell
 * Ergonomic split-pane architecture:
 * - Dynamic Ambient Album Background with real-time liquid glass blur
 * - Non-overlapping TitleBar
 * - Left Player Control / Right Lyrics Editor Split View with authentic translucent glass
 * - Docked Drawer / Modals Layer
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  titleBar,
  leftPanel,
  rightPanel,
  sidebar,
  modals,
  leftWidth,
  isResizing: _isResizing,
  onStartResizing,
}) => {
  return (
    <div className="relative w-screen h-screen flex flex-col text-foreground select-none overflow-hidden bg-background">

      {/* Top Title Bar */}
      {titleBar}

      {/* Main Split Layout: Left (Album & Controls) | Resizer | Right (Lyrics & Translation Table) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Apple Music style Album Art, Scrubber & Controls */}
        <div
          style={{ width: `${leftWidth}px` }}
          className="h-full flex-shrink-0 border-r border-border bg-sidebar flex flex-col transition-none"
        >
          {leftPanel}
        </div>

        {/* Draggable Resizer Handle */}
        <div
          onMouseDown={onStartResizing}
          className="w-1.5 hover:w-2 hover:bg-accent active:bg-muted cursor-col-resize z-20 transition-all flex items-center justify-center group flex-shrink-0 select-none bg-background"
          title="ปรับขนาดแถบควบคุม"
        >
          <div className="h-8 w-0.5 rounded-full bg-border group-hover:bg-muted-foreground transition-colors" />
        </div>

        {/* Right Side: Lyrics Timeline & Translation Table */}
        <div className="flex-1 h-full flex flex-col overflow-hidden bg-background">
          {rightPanel}
        </div>
      </div>

      {/* Docked Document Tabs Sidebar */}
      {sidebar}

      {/* Modals Layer */}
      {modals}
    </div>
  );
};
