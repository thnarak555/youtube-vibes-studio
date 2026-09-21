import React from 'react';
import { TitleBarLayout } from '../../layouts/TitleBarLayout';

export interface WindowTitleBarProps {
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
  onOpenUserLibrary?: () => void;
}

/**
 * WindowTitleBar Component
 * Delegates presentation to TitleBarLayout with genuine Apple ergonomics & luxury window controls.
 */
export const WindowTitleBar: React.FC<WindowTitleBarProps> = ({ 
  onOpenSearch,
  onOpenSettings,
  onOpenUserLibrary
}) => {
  return (
    <TitleBarLayout
      onOpenSearch={onOpenSearch}
      onOpenSettings={onOpenSettings}
      onOpenUserLibrary={onOpenUserLibrary}
    />
  );
};
