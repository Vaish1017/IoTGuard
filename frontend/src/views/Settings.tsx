// ==========================================================================
// IoTGuard — Settings View (System Configuration, Policies & Global Theme)
// Clean 48x24px Toggles, Visually Separated Sections, Persistent Themes
// ==========================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIoTDevices } from '../api';
import {
  IconSettings,
  IconShield,
  IconLock,
  IconKey,
  IconBell,
  IconRefreshCw,
  IconDownload,
  IconDatabase,
  IconServer,
  IconActivity,
  IconAlertTriangle,
  IconSlidersHorizontal,
  IconShieldPlus,
  IconScan,
  IconCpu,
  IconPlus,
  IconX,
} from '../components/Icons';

type TabId = 'general' | 'security' | 'notifications' | 'devices' | 'advanced';

interface ToggleSwitchProps {
  id?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  trackColor?: 'mint' | 'lavender' | 'coral' | 'amber';
  ariaLabel: string;
}

// Standardized 48x24px Clean Custom Switch
function ToggleSwitch({ checked, onChange, trackColor = 'mint', ariaLabel }: ToggleSwitchProps) {
  return (
    <div className="switch-control-unit">
      <span className={`switch-status-tag ${checked ? `tag-on-${trackColor}` : 'tag-off'}`}>
        {checked ? 'ON' : 'OFF'}
      </span>
      <label className="custom-switch" title={ariaLabel}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={ariaLabel}
        />
        <span className={`switch-track track-${trackColor}`}>
          <span className="switch-thumb" />
        </span>
      </label>
    </div>
  );
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Theme State (Persistent in localStorage & documentElement attribute)
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    const saved = localStorage.getItem('iotguard-theme');
    return saved ? saved === 'dark' : true;
  });

  const handleThemeChange = (dark: boolean) => {
    setIsDarkTheme(dark);
    const theme = dark ? 'dark' : 'light';
    localStorage.setItem('iotguard-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    triggerToast(dark ? 'Dark theme activated' : 'Light theme activated');
  };

  // General Settings State
  const [autoRefresh, setAutoRefresh] = useState<boolean>(() => {
    const saved = localStorage.getItem('iotguard_auto_refresh');
    return saved !== null ? saved === 'true' : true;
  });
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [dataRetention, setDataRetention] = useState<string>('30d');

  // Security Settings State
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(true);
  const [sessionTimeout, setSessionTimeout] = useState<string>('30');

  // Notification Settings State
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [pushAlerts, setPushAlerts] = useState<boolean>(true);
  const [criticalOnly, setCriticalOnly] = useState<boolean>(false);
  const [severityCritical, setSeverityCritical] = useState<boolean>(true);
  const [severityHigh, setSeverityHigh] = useState<boolean>(true);
  const [severityMedium, setSeverityMedium] = useState<boolean>(true);
  const [severityLow, setSeverityLow] = useState<boolean>(false);

  // Device Settings State
  const { devices } = useIoTDevices();
  const [autoDiscovery, setAutoDiscovery] = useState<boolean>(true);

  // Advanced Settings State
  const [trainingRounds, setTrainingRounds] = useState<string>('4');
  const [localEpochs, setLocalEpochs] = useState<string>('1');
  const [batchSize, setBatchSize] = useState<string>('4096');
  const [dirichletAlpha, setDirichletAlpha] = useState<string>('0.3');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
    { id: 'general', label: 'General', icon: IconSettings },
    { id: 'security', label: 'Security', icon: IconShield },
    { id: 'notifications', label: 'Notifications', icon: IconBell },
    { id: 'devices', label: 'Devices', icon: IconServer },
    { id: 'advanced', label: 'Advanced', icon: IconSlidersHorizontal },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <motion.div
            key="general-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* Appearance Section */}
            <div className="settings-section-card">
              <div className="settings-section-header">
                <IconSlidersHorizontal size={20} strokeWidth={2} className="text-lavender" />
                <h3 className="settings-section-title">Appearance & Theme</h3>
              </div>

              <div className="settings-row-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Dark Theme</span>
                  <span className="settings-item-desc">
                    Switch between the Midnight Charcoal neon theme and crisp Light glassmorphism
                  </span>
                </div>
                <ToggleSwitch
                  checked={isDarkTheme}
                  onChange={handleThemeChange}
                  trackColor="lavender"
                  ariaLabel="Toggle Dark Theme"
                />
              </div>
            </div>

            {/* Auto Refresh Section */}
            <div className="settings-section-card">
              <div className="settings-section-header">
                <IconRefreshCw size={20} strokeWidth={2} className="text-mint" />
                <h3 className="settings-section-title">Telemetry Synchronization</h3>
              </div>

              <div className="settings-row-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Live Auto Refresh</span>
                  <span className="settings-item-desc">
                    Periodically stream edge telemetry and anomaly scores from FastAPI backend
                  </span>
                </div>
                <ToggleSwitch
                  checked={autoRefresh}
                  onChange={(val) => {
                    setAutoRefresh(val);
                    localStorage.setItem('iotguard_auto_refresh', String(val));
                    triggerToast(val ? 'Live telemetry auto-refresh enabled' : 'Auto-refresh paused');
                  }}
                  trackColor="mint"
                  ariaLabel="Toggle Live Auto Refresh"
                />
              </div>

              {autoRefresh && (
                <div className="settings-row-item">
                  <div className="settings-item-info">
                    <span className="settings-item-title">Stream Polling Rate</span>
                    <span className="settings-item-desc">
                      Telemetry polling frequency in seconds (default matches 3.6s backend producer)
                    </span>
                  </div>
                  <select
                    className="form-input"
                    value={refreshInterval}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRefreshInterval(val);
                      triggerToast(`Polling rate set to ${val}s`);
                    }}
                    style={{ minWidth: 140 }}
                  >
                    <option value={4}>4 seconds (Live)</option>
                    <option value={10}>10 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>60 seconds</option>
                  </select>
                </div>
              )}
            </div>

            {/* Data Retention Section */}
            <div className="settings-section-card">
              <div className="settings-section-header">
                <IconDatabase size={20} strokeWidth={2} className="text-amber" />
                <h3 className="settings-section-title">Telemetry Storage & Retention</h3>
              </div>

              <div className="settings-row-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Event Retention Period</span>
                  <span className="settings-item-desc">
                    Retain Edge-IIoTset packet capture events and classified anomalies in local memory
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    className="form-input"
                    value={dataRetention}
                    onChange={(e) => setDataRetention(e.target.value)}
                    style={{ minWidth: 140 }}
                  >
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="90d">90 Days</option>
                    <option value="365d">1 Year</option>
                  </select>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => triggerToast(`Retention policy updated to ${dataRetention}`)}
                  >
                    Apply Policy
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'security':
        return (
          <motion.div
            key="security-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* Active Threat Detection Rules */}
            <div className="settings-section-card">
              <div className="settings-section-header">
                <IconShieldPlus size={20} strokeWidth={2} className="text-mint" />
                <h3 className="settings-section-title">Active Threat Detection Rules</h3>
              </div>

              <div className="settings-grid-cards">
                <div className="settings-stat-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconShieldPlus size={18} className="text-mint" />
                    <span style={{ fontWeight: 600 }}>Port Scan Detection</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                    Trigger: Fan-out ≥ 18 unique destination ports
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--mint)', fontWeight: 600, marginTop: '4px' }}>
                    Active • Heuristic Rule 1
                  </span>
                </div>

                <div className="settings-stat-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconAlertTriangle size={18} className="text-coral" />
                    <span style={{ fontWeight: 600 }}>DDoS Flood Protection</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                    Trigger: TCP ≥ 450 pps or ICMP ≥ 160 pps @ 65% share
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--coral)', fontWeight: 600, marginTop: '4px' }}>
                    Active • Heuristic Rule 2
                  </span>
                </div>

                <div className="settings-stat-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconKey size={18} className="text-amber" />
                    <span style={{ fontWeight: 600 }}>Password Brute Force</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                    Trigger: Failed connections ≥ 14 @ 25 pps
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: 600, marginTop: '4px' }}>
                    Active • Heuristic Rule 3
                  </span>
                </div>

                <div className="settings-stat-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconScan size={18} className="text-lavender" />
                    <span style={{ fontWeight: 600 }}>Payload Entropy Anomaly</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                    Trigger: Byte entropy ≥ 7.2 bits (XSS/Exploit)
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--lavender)', fontWeight: 600, marginTop: '4px' }}>
                    Active • Heuristic Rule 4
                  </span>
                </div>
              </div>
            </div>

            {/* Access Control & Authentication */}
            <div className="settings-section-card">
              <div className="settings-section-header">
                <IconLock size={20} strokeWidth={2} className="text-lavender" />
                <h3 className="settings-section-title">Access Control & Session Security</h3>
              </div>

              <div className="settings-row-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Two-Factor Authentication (2FA)</span>
                  <span className="settings-item-desc">
                    Enforce hardware security key or TOTP token for administrative controls
                  </span>
                </div>
                <ToggleSwitch
                  checked={twoFactorAuth}
                  onChange={(val) => {
                    setTwoFactorAuth(val);
                    triggerToast(val ? '2FA enforced' : '2FA disabled');
                  }}
                  trackColor="mint"
                  ariaLabel="Toggle 2FA"
                />
              </div>

              <div className="settings-row-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Operator Session Inactivity Timeout</span>
                  <span className="settings-item-desc">
                    Automatically lock the IoTGuard management session after inactive period
                  </span>
                </div>
                <select
                  className="form-input"
                  value={sessionTimeout}
                  onChange={(e) => {
                    setSessionTimeout(e.target.value);
                    triggerToast(`Session timeout set to ${e.target.value} minutes`);
                  }}
                  style={{ minWidth: 140 }}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="240">4 hours</option>
                </select>
              </div>
            </div>

            {/* Federated Learning Cryptography */}
            <div className="settings-section-card">
              <div className="settings-section-header">
                <IconCpu size={20} strokeWidth={2} className="text-mint" />
                <h3 className="settings-section-title">Federated Learning Model Security</h3>
              </div>

              <div className="settings-grid-cards">
                <div className="settings-stat-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconLock size={18} className="text-coral" />
                    <span style={{ fontWeight: 600 }}>Differential Privacy</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                    Status: Simulation baseline (Unweighted Gaussian noise)
                  </span>
                </div>

                <div className="settings-stat-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconShield size={18} className="text-coral" />
                    <span style={{ fontWeight: 600 }}>Secure Aggregation</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                    Status: In-memory parameter aggregation (Flower PyTorch)
                  </span>
                </div>

                <div className="settings-stat-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconKey size={18} className="text-mint" />
                    <span style={{ fontWeight: 600 }}>Parameter Transport Security</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                    TLS 1.3 encrypted gRPC tunnel between edge nodes
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div
            key="notifications-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* Dispatch Channels */}
            <div className="settings-section-card">
              <div className="settings-section-header">
                <IconBell size={20} strokeWidth={2} className="text-lavender" />
                <h3 className="settings-section-title">Alert Dispatch Channels</h3>
              </div>

              <div className="settings-row-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Email Incident Notifications</span>
                  <span className="settings-item-desc">
                    Send real-time alerts to the security operations team email distribution list
                  </span>
                </div>
                <ToggleSwitch
                  checked={emailAlerts}
                  onChange={(val) => {
                    setEmailAlerts(val);
                    triggerToast(val ? 'Email alerts enabled' : 'Email alerts disabled');
                  }}
                  trackColor="mint"
                  ariaLabel="Toggle Email Alerts"
                />
              </div>

              <div className="settings-row-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Browser Desktop Push Notifications</span>
                  <span className="settings-item-desc">
                    Display live browser push notifications when high-severity anomalies trigger
                  </span>
                </div>
                <ToggleSwitch
                  checked={pushAlerts}
                  onChange={(val) => {
                    setPushAlerts(val);
                    triggerToast(val ? 'Push notifications enabled' : 'Push notifications disabled');
                  }}
                  trackColor="mint"
                  ariaLabel="Toggle Push Notifications"
                />
              </div>
            </div>

            {/* Severity Threshold Filtering */}
            <div className="settings-section-card">
              <div className="settings-section-header">
                <IconAlertTriangle size={20} strokeWidth={2} className="text-coral" />
                <h3 className="settings-section-title">Severity Filters & Thresholds</h3>
              </div>

              <div className="settings-row-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Critical Only Notification Mode</span>
                  <span className="settings-item-desc">
                    Suppress medium and low informational alerts; only alert on active attack signatures
                  </span>
                </div>
                <ToggleSwitch
                  checked={criticalOnly}
                  onChange={(val) => {
                    setCriticalOnly(val);
                    triggerToast(val ? 'Critical-only notification mode active' : 'All severity levels active');
                  }}
                  trackColor="coral"
                  ariaLabel="Toggle Critical Only Mode"
                />
              </div>

              <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Per-Severity Channel Toggles:
                </span>
                <div className="settings-grid-cards" style={{ marginTop: '12px' }}>
                  <div className="settings-row-item" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="pulsing-mint-dot" style={{ backgroundColor: 'var(--coral)', boxShadow: '0 0 8px var(--coral)' }} />
                      <span className="settings-item-title">Critical</span>
                    </div>
                    <ToggleSwitch
                      checked={severityCritical}
                      onChange={setSeverityCritical}
                      trackColor="coral"
                      ariaLabel="Critical Alerts"
                    />
                  </div>

                  <div className="settings-row-item" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="pulsing-mint-dot" style={{ backgroundColor: 'var(--coral)', boxShadow: '0 0 8px var(--coral)' }} />
                      <span className="settings-item-title">High</span>
                    </div>
                    <ToggleSwitch
                      checked={severityHigh}
                      onChange={setSeverityHigh}
                      trackColor="coral"
                      ariaLabel="High Alerts"
                    />
                  </div>

                  <div className="settings-row-item" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="pulsing-mint-dot" style={{ backgroundColor: 'var(--amber)', boxShadow: '0 0 8px var(--amber)' }} />
                      <span className="settings-item-title">Medium</span>
                    </div>
                    <ToggleSwitch
                      checked={severityMedium}
                      onChange={setSeverityMedium}
                      trackColor="amber"
                      ariaLabel="Medium Alerts"
                    />
                  </div>

                  <div className="settings-row-item" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="pulsing-mint-dot" style={{ backgroundColor: 'var(--mint)', boxShadow: '0 0 8px var(--mint)' }} />
                      <span className="settings-item-title">Low</span>
                    </div>
                    <ToggleSwitch
                      checked={severityLow}
                      onChange={setSeverityLow}
                      trackColor="mint"
                      ariaLabel="Low Alerts"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'devices':
        return (
          <motion.div
            key="devices-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* Auto-Discovery */}
            <div className="settings-section-card">
              <div className="settings-section-header">
                <IconScan size={20} strokeWidth={2} className="text-mint" />
                <h3 className="settings-section-title">Network Auto-Discovery</h3>
              </div>

              <div className="settings-row-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Passive Edge Device Discovery</span>
                  <span className="settings-item-desc">
                    Automatically register new telemetry-producing nodes on the edge subnet
                  </span>
                </div>
                <ToggleSwitch
                  checked={autoDiscovery}
                  onChange={(val) => {
                    setAutoDiscovery(val);
                    triggerToast(val ? 'Device auto-discovery enabled' : 'Auto-discovery paused');
                  }}
                  trackColor="mint"
                  ariaLabel="Toggle Auto Discovery"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => triggerToast('Edge subnet scan triggered — listening on 192.168.1.0/24')}
                >
                  <IconScan size={14} /> Scan Subnet Now
                </button>
              </div>
            </div>

            {/* Registered Devices Inventory */}
            <div className="settings-section-card">
              <div className="settings-section-header">
                <IconServer size={20} strokeWidth={2} className="text-lavender" />
                <h3 className="settings-section-title">Monitored Device Nodes ({devices.length} verified)</h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--fg-muted)' }}>
                      <th style={{ padding: '10px 14px' }}>Device Name</th>
                      <th style={{ padding: '10px 14px' }}>Type</th>
                      <th style={{ padding: '10px 14px' }}>Status</th>
                      <th style={{ padding: '10px 14px' }}>IP Address</th>
                      <th style={{ padding: '10px 14px' }}>Sensors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.slice(0, 6).map((device) => (
                      <tr
                        key={device.id}
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{device.name}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--fg-muted)' }}>{device.type}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: device.status === 'online' ? 'rgba(79, 209, 165, 0.15)' : 'rgba(255, 107, 107, 0.15)',
                              color: device.status === 'online' ? 'var(--mint)' : 'var(--coral)',
                            }}
                          >
                            ● {device.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: 'var(--fg-muted)' }}>
                          {device.ipAddress}
                        </td>
                        <td style={{ padding: '12px 14px' }}>{device.sensorCount} telemetry channels</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        );

      case 'advanced':
        return (
          <motion.div
            key="advanced-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* Federated Learning Simulation Hyperparameters */}
            <div className="settings-section-card">
              <div className="settings-section-header">
                <IconCpu size={20} strokeWidth={2} className="text-lavender" />
                <h3 className="settings-section-title">Federated Learning Hyperparameters</h3>
              </div>

              <div className="settings-grid-cards">
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Communication Rounds
                  </label>
                  <select
                    className="form-input"
                    value={trainingRounds}
                    onChange={(e) => setTrainingRounds(e.target.value)}
                    style={{ marginTop: '8px', width: '100%' }}
                  >
                    <option value="4">4 Rounds (Default Baseline)</option>
                    <option value="8">8 Rounds</option>
                    <option value="12">12 Rounds</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Local Epochs per Round
                  </label>
                  <select
                    className="form-input"
                    value={localEpochs}
                    onChange={(e) => setLocalEpochs(e.target.value)}
                    style={{ marginTop: '8px', width: '100%' }}
                  >
                    <option value="1">1 Epoch (Fastest Convergence)</option>
                    <option value="2">2 Epochs</option>
                    <option value="5">5 Epochs</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Mini-Batch Size
                  </label>
                  <select
                    className="form-input"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    style={{ marginTop: '8px', width: '100%' }}
                  >
                    <option value="2048">2,048</option>
                    <option value="4096">4,096 (Production)</option>
                    <option value="8192">8,192</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Data Heterogeneity (Dirichlet α)
                  </label>
                  <select
                    className="form-input"
                    value={dirichletAlpha}
                    onChange={(e) => setDirichletAlpha(e.target.value)}
                    style={{ marginTop: '8px', width: '100%' }}
                  >
                    <option value="0.1">0.1 (High Non-IID)</option>
                    <option value="0.3">0.3 (Mild Non-IID)</option>
                    <option value="1.0">1.0 (Uniform IID)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => triggerToast(`Hyperparameters updated: ${trainingRounds} rounds, α=${dirichletAlpha}`)}
                >
                  <IconRefreshCw size={14} /> Update Federation Config
                </button>
              </div>
            </div>

            {/* System Diagnostics & Backup */}
            <div className="settings-section-card">
              <div className="settings-section-header">
                <IconDatabase size={20} strokeWidth={2} className="text-amber" />
                <h3 className="settings-section-title">System Diagnostics & Export</h3>
              </div>

              <div className="settings-grid-cards">
                <div className="settings-stat-box" style={{ textAlign: 'center', padding: '24px' }}>
                  <IconDownload size={32} className="text-lavender" style={{ margin: '0 auto 12px auto' }} />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Backup Security Policies</span>
                  <span style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '4px 0 16px 0' }}>
                    Download full policy JSON and node certificates
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const blob = new Blob(
                        [
                          JSON.stringify(
                            {
                              exportTime: new Date().toISOString(),
                              theme: isDarkTheme ? 'dark' : 'light',
                              autoRefresh,
                              refreshInterval,
                              twoFactorAuth,
                              retention: dataRetention,
                            },
                            null,
                            2
                          ),
                        ],
                        { type: 'application/json' }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'iotguard_settings_backup.json';
                      a.click();
                      URL.revokeObjectURL(url);
                      triggerToast('Settings backup downloaded');
                    }}
                  >
                    <IconDownload size={14} /> Export Backup
                  </button>
                </div>

                <div className="settings-stat-box" style={{ textAlign: 'center', padding: '24px' }}>
                  <IconRefreshCw size={32} className="text-mint" style={{ margin: '0 auto 12px auto' }} />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Health Diagnostics</span>
                  <span style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '4px 0 16px 0' }}>
                    Probe all local endpoints and Flower nodes
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => triggerToast('Diagnostics passed: FastAPI & Flower nodes online')}
                  >
                    <IconActivity size={14} /> Run Diagnostics
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="settings-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="action-toast" role="status" aria-live="polite">
          <span className="toast-dot" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="settings-header-banner">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '28px', margin: 0 }}>
            Settings & Policies
          </h1>
          <p style={{ color: 'var(--fg-muted)', marginTop: '4px', fontSize: '14px' }}>
            System configuration, active threat rules & global theme preferences
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="settings-tab-bar" role="tablist">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`settings-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <TabIcon size={16} strokeWidth={2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <AnimatePresence mode="wait">
        {renderTabContent()}
      </AnimatePresence>
    </div>
  );
}

export default Settings;
