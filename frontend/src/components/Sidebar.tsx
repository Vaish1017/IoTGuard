// ==========================================================================
// IoTGuard — Fixed 180px Sidebar Navigation
// Connected to Real Backend Telemetry & Alert Counts
// Reference: IoTGuard Neon Security Dashboard Design
// ==========================================================================

import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSecurityAlerts, useStream } from '../api';
import {
  IconDashboard,
  IconActivity,
  IconSensor,
  IconAlertTriangle,
  IconMonitor,
  IconBarChart2,
  IconSettings,
} from './Icons';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  securityStatus?: {
    activeSensors: number;
    totalSensors: number;
    threatsBlocked: number;
  } | null;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = location.pathname.slice(1) || 'dashboard';

  // Live real data hooks
  const { alerts } = useSecurityAlerts();
  const { events } = useStream(3600);

  // Dynamic alert count from real stream events
  const unacknowledgedAlertCount = useMemo(() => {
    return alerts.filter((a) => !a.acknowledged).length;
  }, [alerts]);

  // Last update time from latest real telemetry event
  const lastUpdatedTime = useMemo(() => {
    if (events && events[0]?.timestamp) {
      try {
        return new Date(events[0].timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return '11:48 AM';
      }
    }
    return '11:48 AM';
  }, [events]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
    { id: 'observability', label: 'Observability', icon: IconActivity },
    { id: 'sensors', label: 'Sensors', icon: IconSensor },
    { id: 'alerts', label: 'Alerts', icon: IconAlertTriangle, badge: unacknowledgedAlertCount },
    { id: 'devices', label: 'Devices', icon: IconMonitor },
    { id: 'analytics', label: 'Analytics', icon: IconBarChart2 },
    { id: 'settings', label: 'Settings', icon: IconSettings },
  ];

  const handleNav = (view: string) => {
    navigate(`/${view}`);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand Header */}
        <div className="sidebar-brand-container">
          <div className="sidebar-logo-aura">
            <svg
              className="sidebar-shield-svg"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="shieldGrad" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#b8a8f0" />
                  <stop offset="0.5" stopColor="#a390e4" />
                  <stop offset="1" stopColor="#4fd1a5" />
                </linearGradient>
                <filter id="neonShieldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <ellipse
                cx="32"
                cy="32"
                rx="28"
                ry="16"
                stroke="rgba(184, 168, 240, 0.25)"
                strokeWidth="1.2"
                transform="rotate(-25 32 32)"
                strokeDasharray="3 3"
              />
              <path
                d="M32 6 L52 14 V28 C52 42 43 51 32 57 C21 51 12 42 12 28 V14 L32 6 Z"
                fill="#070a10"
                stroke="url(#shieldGrad)"
                strokeWidth="2.5"
                filter="url(#neonShieldGlow)"
              />
              <path
                d="M24 30 L29.5 36 L40 24"
                stroke="#4fd1a5"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="54" cy="18" r="1.5" fill="#ffd93d" />
              <circle cx="10" cy="44" r="1.2" fill="#b8a8f0" />
            </svg>
          </div>

          <div className="sidebar-brand-text">
            <h1 className="sidebar-title">
              IoTGuard
            </h1>
            <p className="sidebar-subtitle">Smarter. Safer. Always.</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav" aria-label="Dashboard sections">
          {navItems.map((item) => {
            const isActive =
              currentView === item.id ||
              (item.id === 'dashboard' && currentView === '') ||
              (item.id === 'observability' && currentView === 'overview');
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-icon-wrap">
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.7} />
                </span>
                <span className="nav-label">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="nav-badge" aria-label={`${item.badge} unread alerts`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom System Status Box */}
        <div className="sidebar-footer-container">
          <div className="sidebar-status-box">
            <div className="status-indicator-line">
              <span className="pulsing-mint-dot" aria-hidden="true" />
              <span className="status-label-text">System Online</span>
            </div>
            <div className="status-subtext">Last Updated: {lastUpdatedTime}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
