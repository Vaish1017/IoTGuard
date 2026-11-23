// ==========================================================================
// IoTGuard — Icon Components (inline SVGs, zero deps)
// ==========================================================================

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

const strokeWidth = (props: IconProps) => props.strokeWidth ?? 1.5;
const sz = (props: IconProps) => props.size ?? 20;

export function IconDashboard(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>;
}

export function IconShieldCheck(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>;
}

export function IconActivity(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>;
}

export function IconUsers(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>;
}

export function IconFlaskConical(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 2v7.31"/><path d="M14 2v7.31"/><path d="M8.5 2h7"/><path d="M7 16H3"/><path d="M17 16h4"/>
    <path d="M9 22h6"/><path d="M12 4.69v15.31"/><path d="M5 9l3-3 3 3"/>
  </svg>;
}

export function IconTerminal(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>
  </svg>;
}

export function IconSettings(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>;
}

export function IconChevronRight(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m9 18 6-6-6-6"/>
  </svg>;
}

export function IconMenu(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
  </svg>;
}

export function IconX(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
  </svg>;
}

export function IconAlertTriangle(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>
  </svg>;
}

export function IconInfo(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>
  </svg>;
}

export function IconRefreshCw(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
  </svg>;
}

export function IconDownload(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
  </svg>;
}

export function IconWifi(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/>
  </svg>;
}

export function IconServer(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>
  </svg>;
}

export function IconDatabase(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>;
}

export function IconTrendingUp(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>;
}

export function IconTarget(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>;
}

export function IconGitBranch(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>
  </svg>;
}

export function IconClock(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>;
}

export function IconZap(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>;
}

export function IconCpu(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
    <line x1="9" x2="4" y1="1" y2="1"/><line x1="15" x2="20" y1="1" y2="1"/>
    <line x1="9" x2="4" y1="23" y2="23"/><line x1="15" x2="20" y1="23" y2="23"/>
    <line x1="1" x2="1" y1="9" y2="14"/><line x1="23" x2="23" y1="9" y2="14"/>
  </svg>;
}

export function IconFileText(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>
  </svg>;
}

export function IconEye(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>
  </svg>;
}

export function IconExternalLink(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>
  </svg>;
}

export function IconCheckCircle(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>;
}

export function IconSearch(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/>
  </svg>;
}

export function IconFilter(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>;
}

export function IconArrowUpRight(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="7" x2="17" y1="17" y2="7"/><polyline points="17 7 21 7 21 11"/>
  </svg>;
}

export function IconArrowDownRight(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="7" x2="17" y1="7" y2="17"/><polyline points="17 17 21 17 21 13"/>
  </svg>;
}

export function IconMinus(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" x2="19" y1="12" y2="12"/>
  </svg>;
}

export function IconPlus(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>
  </svg>;
}

export function IconCpuChip(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
    <line x1="9" x2="4" y1="1" y2="1"/><line x1="15" x2="20" y1="1" y2="1"/>
    <line x1="9" x2="4" y1="23" y2="23"/><line x1="15" x2="20" y1="23" y2="23"/>
    <line x1="1" x2="1" y1="9" y2="14"/><line x1="23" x2="23" y1="9" y2="14"/>
  </svg>;
}

export function IconChevronLeft(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 18 9 12 15 6"/>
  </svg>;
}

export function IconPlay(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>;
}

export function IconPause(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>;
}

export function IconShield(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>;
}

export function IconShieldOff(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>;
}

export function IconShieldAlert(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <line x1="12" x2="12" y1="9" y2="13"/>
    <line x1="12" x2="12.01" y1="17" y2="17"/>
  </svg>;
}

export function IconSensor(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="M4.93 4.93l1.41 1.41"/>
    <path d="M17.66 17.66l1.41 1.41"/>
    <path d="M4.93 19.07l1.41-1.41"/>
    <path d="M17.66 6.34l1.41-1.41"/>
  </svg>;
}

export function IconNetwork(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="2"/>
    <path d="M8 12h8"/>
    <path d="M12 8v8"/>
  </svg>;
}

export function IconBell(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>;
}

export function IconBellOff(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>;
}

export function IconSmartphone(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" x2="12.01" y1="18" y2="18"/>
  </svg>;
}

export function IconMonitor(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" x2="16" y1="21" y2="21"/>
    <line x1="12" x2="12.01" y1="17" y2="21"/>
  </svg>;
}

export function IconRouter(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3.05 19a10 10 0 0 1 17.9 0"/>
    <path d="M12 2v20"/>
    <path d="M5 12h14"/>
  </svg>;
}

export function IconShieldPlus(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <line x1="12" x2="12" y1="9" y2="15"/>
    <line x1="9" x2="15" y1="12" y2="12"/>
  </svg>;
}

export function IconScan(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
    <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
    <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <path d="M12 7v10"/>
    <path d="M7 12h10"/>
  </svg>;
}

export function IconLock(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>;
}

export function IconKey(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m21 2-9.64 9.64"/>
    <path d="M6.61 17.39a4 4 0 1 1 5.66-5.66l9 9a1 1 0 0 1-1.42 1.42l-9-9a4 4 0 0 1-5.66 5.66"/>
    <circle cx="7.5" cy="7.5" r="2.5"/>
  </svg>;
}

export function IconUsers2(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>;
}

export function IconSlidersHorizontal(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="4" x2="20" y1="21" y2="21"/>
    <line x1="4" x2="20" y1="14" y2="14"/>
    <line x1="4" x2="20" y1="7" y2="7"/>
    <line x1="6" x2="6" y1="17" y2="11"/>
    <line x1="10" x2="10" y1="10" y2="4"/>
    <line x1="18" x2="18" y1="17" y2="11"/>
  </svg>;
}

export function IconActivity2(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>;
}

export function IconBarChart2(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" x2="18" y1="20" y2="10"/>
    <line x1="12" x2="12" y1="20" y2="4"/>
    <line x1="6" x2="6" y1="20" y2="14"/>
  </svg>;
}

export function IconAlertCircle(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" x2="12" y1="8" y2="12"/>
    <line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>;
}

export function IconCheck(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>;
}

export function IconMoreHorizontal(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="1"/>
    <circle cx="19" cy="12" r="1"/>
    <circle cx="5" cy="12" r="1"/>
  </svg>;
}

export function IconArrowRight(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" x2="19" y1="12" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>;
}

export function IconArrowLeft(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="19" x2="5" y1="12" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>;
}

export function IconHome(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>;
}

export function IconMoon(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>;
}

export function IconPower(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
    <line x1="12" x2="12" y1="2" y2="12"/>
  </svg>;
}

export function IconThermometer(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
  </svg>;
}

export function IconDroplet(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
  </svg>;
}

export function IconLightbulb(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
  </svg>;
}

export function IconCamera(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>;
}

export function IconPlug(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22v-5"/>
    <path d="M9 8V2"/>
    <path d="M15 8V2"/>
    <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>
  </svg>;
}

export function IconUserWalking(props: IconProps) {
  const s = sz(props); const sw = strokeWidth(props);
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="13" cy="4" r="2"/>
    <path d="m14 13-3 3-4-2"/>
    <path d="m9 8 3 3 4-2 3 4"/>
    <path d="m11 16 2 5"/>
  </svg>;
}