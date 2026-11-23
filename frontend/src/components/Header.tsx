// ==========================================================================
// IoTGuard — Top Mobile Header (Desktop layout uses fixed sidebar & dashboard header)
// ==========================================================================

import React from 'react';
import { IconMenu } from './Icons';

interface HeaderProps {
  onMenuClick: () => void;
  onRefresh?: () => void;
  onToggleCollapse?: () => void;
  sidebarCollapsed?: boolean;
  isStreaming?: boolean;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="mobile-top-bar" aria-label="Mobile header">
      <button
        className="mobile-menu-toggle-btn"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <IconMenu size={22} strokeWidth={2} />
      </button>

      <div className="mobile-logo-brand">
        IoT<span className="brand-accent">Guard</span>
      </div>

      <div className="mobile-status-dot-wrap">
        <span className="pulsing-mint-dot" aria-label="Status: Online" />
      </div>
    </header>
  );
}
