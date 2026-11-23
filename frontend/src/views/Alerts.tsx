// ==========================================================================
// IoTGuard — Alerts View (De-cluttered Layout, Real Data & Full Interactivity)
// Connected to FastAPI Backend Telemetry (/api/stream, /api/simulation)
// ==========================================================================

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecurityAlerts } from '../api';
import {
  IconAlertTriangle,
  IconAlertCircle,
  IconBell,
  IconCheckCircle,
  IconFilter,
  IconRefreshCw,
  IconDownload,
  IconX,
  IconClock,
  IconServer,
  IconShield,
  IconSearch,
} from '../components/Icons';

type SeverityType = 'critical' | 'high' | 'medium' | 'low';

const SEVERITY_CONFIG: Record<
  SeverityType,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  }
> = {
  critical: {
    label: 'Critical',
    color: 'var(--coral)',
    bg: 'var(--coral-dim)',
    border: 'rgba(255, 107, 107, 0.3)',
    icon: IconAlertTriangle,
  },
  high: {
    label: 'High',
    color: 'var(--coral)',
    bg: 'var(--coral-dim)',
    border: 'rgba(255, 107, 107, 0.3)',
    icon: IconAlertCircle,
  },
  medium: {
    label: 'Medium',
    color: 'var(--amber)',
    bg: 'var(--amber-dim)',
    border: 'rgba(255, 217, 61, 0.3)',
    icon: IconAlertCircle,
  },
  low: {
    label: 'Low',
    color: 'var(--mint)',
    bg: 'var(--mint-dim)',
    border: 'rgba(79, 209, 165, 0.3)',
    icon: IconBell,
  },
};

const SEVERITY_ORDER: Record<SeverityType, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function Alerts() {
  const {
    alerts,
    acknowledgeAlert,
    acknowledgeAll,
    dismissAlert,
    resetAlerts,
    refetch,
    loading,
  } = useSecurityAlerts();

  const [filterSeverity, setFilterSeverity] = useState<'all' | SeverityType>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'time_desc' | 'time_asc' | 'severity' | 'source'>('time_desc');
  const [acknowledgedFilter, setAcknowledgedFilter] = useState<'all' | 'unacknowledged' | 'acknowledged'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Live real counts by severity
  const severityCounts = useMemo(() => {
    return {
      critical: alerts.filter((a) => a.severity === 'critical').length,
      high: alerts.filter((a) => a.severity === 'high').length,
      medium: alerts.filter((a) => a.severity === 'medium').length,
      low: alerts.filter((a) => a.severity === 'low').length,
    };
  }, [alerts]);

  // Filtered & Sorted alerts
  const filteredAlerts = useMemo(() => {
    return alerts
      .filter((alert) => {
        if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
        if (acknowledgedFilter === 'unacknowledged' && alert.acknowledged) return false;
        if (acknowledgedFilter === 'acknowledged' && !alert.acknowledged) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = alert.title.toLowerCase().includes(q);
          const matchDesc = alert.description.toLowerCase().includes(q);
          const matchSource = alert.source.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchSource) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'severity') {
          return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
        }
        if (sortBy === 'source') {
          return a.source.localeCompare(b.source);
        }
        if (sortBy === 'time_asc') {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [alerts, filterSeverity, acknowledgedFilter, search, sortBy]);

  // Handle Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast('Alerts refreshed from backend');
    }, 400);
  };

  // Handle Acknowledge single
  const handleAcknowledge = (id: string, title: string) => {
    acknowledgeAlert(id);
    triggerToast(`Acknowledged: ${title}`);
  };

  // Handle Dismiss single
  const handleDismiss = (id: string, title: string) => {
    dismissAlert(id);
    triggerToast(`Dismissed: ${title}`);
  };

  // Handle Acknowledge All
  const handleAcknowledgeAll = () => {
    acknowledgeAll();
    triggerToast('All current alerts acknowledged');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredAlerts.length === 0) {
      triggerToast('No alerts to export');
      return;
    }
    const headers = ['ID', 'Severity', 'Title', 'Description', 'Source Device', 'Timestamp', 'Acknowledged'];
    const rows = filteredAlerts.map((a) => [
      `"${a.id}"`,
      `"${a.severity.toUpperCase()}"`,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.description.replace(/"/g, '""')}"`,
      `"${a.source}"`,
      `"${a.timestamp}"`,
      `"${a.acknowledged ? 'Yes' : 'No'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `iotguard_alerts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`Exported ${filteredAlerts.length} alerts to CSV`);
  };

  const handleResetFilters = () => {
    setFilterSeverity('all');
    setAcknowledgedFilter('all');
    setSearch('');
    setSortBy('time_desc');
  };

  return (
    <div className="alerts-page-container">
      {/* Toast Alert Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="action-toast"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <IconCheckCircle size={16} strokeWidth={2.2} className="toast-icon-mint" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Row */}
      <motion.div
        className="alerts-header-row"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '26px', margin: 0 }}>
            Security Alerts
          </h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Real-time threat detection events & anomaly incidents ({alerts.length} total captured)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <motion.button
            className="btn btn-ghost btn-sm"
            onClick={handleRefresh}
            whileTap={{ scale: 0.95 }}
            disabled={isRefreshing || loading}
            title="Fetch latest stream alerts from backend"
          >
            <IconRefreshCw size={15} strokeWidth={2} className={isRefreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </motion.button>

          <motion.button
            className="btn btn-ghost btn-sm"
            onClick={handleExportCSV}
            whileTap={{ scale: 0.95 }}
            title="Download alerts as CSV"
          >
            <IconDownload size={15} strokeWidth={2} />
            <span>Export CSV</span>
          </motion.button>

          <motion.button
            className="btn btn-primary btn-sm"
            onClick={handleAcknowledgeAll}
            whileTap={{ scale: 0.95 }}
            disabled={alerts.every((a) => a.acknowledged) || alerts.length === 0}
            title="Mark all current alerts as acknowledged"
          >
            <IconCheckCircle size={15} strokeWidth={2} />
            <span>Acknowledge All</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Severity Metric Cards */}
      <motion.div
        className="alerts-kpi-grid"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        {(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
          const cfg = SEVERITY_CONFIG[sev];
          const count = severityCounts[sev];
          const isSelected = filterSeverity === sev;
          const Icon = cfg.icon;

          return (
            <motion.div
              key={sev}
              className={`glass-card alert-kpi-card ${isSelected ? 'selected-filter' : ''}`}
              onClick={() => setFilterSeverity(isSelected ? 'all' : sev)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              role="button"
              tabIndex={0}
              aria-label={`Filter by ${cfg.label} severity (${count} alerts)`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setFilterSeverity(isSelected ? 'all' : sev);
                }
              }}
            >
              <div
                className="alert-kpi-icon"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                <Icon size={22} strokeWidth={2} />
              </div>
              <div className="alert-kpi-info">
                <span className="alert-kpi-value" style={{ color: cfg.color }}>
                  {count}
                </span>
                <span className="alert-kpi-label">
                  {cfg.label} Severity
                  {isSelected && <span style={{ marginLeft: '4px', color: 'var(--lavender)' }}>• Active</span>}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Toolbar: Filters, Status, Search, and Sort */}
      <motion.div
        className="glass-card alerts-toolbar-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="alerts-filter-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
            <IconFilter size={15} strokeWidth={2} style={{ color: 'var(--fg-muted)' }} />
            <span style={{ fontSize: '11px', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Severity:
            </span>
          </div>

          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
            <button
              key={sev}
              className={`filter-chip-btn ${filterSeverity === sev ? 'active' : ''}`}
              onClick={() => setFilterSeverity(sev)}
            >
              {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
              {sev !== 'all' && severityCounts[sev] > 0 && ` (${severityCounts[sev]})`}
            </button>
          ))}

          <div
            style={{
              height: '18px',
              width: '1px',
              background: 'var(--border-subtle)',
              margin: '0 6px',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Status:
            </span>
          </div>

          {(['all', 'unacknowledged', 'acknowledged'] as const).map((st) => (
            <button
              key={st}
              className={`filter-chip-btn ${acknowledgedFilter === st ? 'active' : ''}`}
              onClick={() => setAcknowledgedFilter(st)}
            >
              {st === 'all'
                ? 'All'
                : st === 'unacknowledged'
                ? 'Unread'
                : 'Acknowledged'}
            </button>
          ))}
        </div>

        <div className="alerts-controls-right">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="form-input"
            style={{ minWidth: '150px', height: '36px', fontSize: '12.5px' }}
            aria-label="Sort alerts by"
          >
            <option value="time_desc">Sort: Newest First</option>
            <option value="time_asc">Sort: Oldest First</option>
            <option value="severity">Sort: By Severity</option>
            <option value="source">Sort: Device ID</option>
          </select>

          <div className="alerts-search-box">
            <IconSearch size={15} strokeWidth={2} className="alerts-search-icon" />
            <input
              type="text"
              placeholder="Search by title, description or device..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search alerts"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--fg-muted)',
                  cursor: 'pointer',
                  padding: 2,
                }}
                aria-label="Clear search"
              >
                <IconX size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Alert Feed Container */}
      <motion.div
        className="glass-card alerts-feed-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fg)' }}>
              Alert Feed
            </div>
            <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '2px' }}>
              Showing {filteredAlerts.length} of {alerts.length} events
              {filterSeverity !== 'all' && ` • Filtered by ${filterSeverity}`}
              {acknowledgedFilter !== 'all' && ` • ${acknowledgedFilter}`}
            </div>
          </div>

          {(filterSeverity !== 'all' || acknowledgedFilter !== 'all' || search) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleResetFilters}
              style={{ fontSize: '12px' }}
            >
              Reset Filters
            </button>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {filteredAlerts.length > 0 ? (
            <motion.div layout initial={false}>
              {filteredAlerts.map((alert) => {
                const cfg = SEVERITY_CONFIG[alert.severity];
                const Icon = cfg.icon;

                return (
                  <motion.div
                    key={alert.id}
                    className={`alert-feed-item-row ${!alert.acknowledged ? 'unread' : 'acknowledged'}`}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Severity Pill */}
                    <div className={`alert-severity-pill ${alert.severity}`}>
                      <Icon size={13} strokeWidth={2.4} />
                      <span>{cfg.label}</span>
                    </div>

                    {/* Alert Information */}
                    <div className="alert-feed-content">
                      <div className="alert-feed-header-line">
                        <span className="alert-feed-title">{alert.title}</span>
                        {!alert.acknowledged && (
                          <span
                            className="badge"
                            style={{
                              background: 'var(--coral-dim)',
                              color: 'var(--coral)',
                              fontSize: '10px',
                              padding: '2px 7px',
                              fontWeight: 700,
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </div>

                      <div className="alert-feed-desc">
                        {alert.description}
                      </div>

                      <div className="alert-feed-meta-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <IconServer size={13} strokeWidth={1.8} style={{ color: 'var(--fg-subtle)' }} />
                          <span>Device: <strong style={{ color: 'var(--fg)' }}>{alert.source}</strong></span>
                        </div>
                        <span>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <IconClock size={13} strokeWidth={1.8} style={{ color: 'var(--fg-subtle)' }} />
                          <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          <span style={{ color: 'var(--fg-dim)' }}>
                            ({new Date(alert.timestamp).toLocaleDateString()})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="alert-feed-actions">
                      {!alert.acknowledged && (
                        <motion.button
                          className="btn btn-mint btn-sm"
                          onClick={() => handleAcknowledge(alert.id, alert.title)}
                          whileTap={{ scale: 0.92 }}
                          title="Acknowledge alert"
                          style={{ padding: '6px 12px' }}
                        >
                          <IconCheckCircle size={14} strokeWidth={2.2} />
                          <span style={{ fontSize: '12px' }}>Acknowledge</span>
                        </motion.button>
                      )}

                      <motion.button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDismiss(alert.id, alert.title)}
                        whileTap={{ scale: 0.92 }}
                        title="Dismiss alert"
                        style={{ padding: '6px 10px' }}
                      >
                        <IconX size={14} strokeWidth={2} />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              className="empty-state"
              style={{ padding: '48px 24px', textAlign: 'center' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <IconShield
                size={54}
                strokeWidth={1.5}
                style={{ color: 'var(--mint)', opacity: 0.6, marginBottom: '12px' }}
              />
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--fg)' }}>
                No Alerts Matching Current Filter
              </div>
              <p style={{ color: 'var(--fg-muted)', fontSize: '13px', maxWidth: '400px', margin: '6px auto 16px' }}>
                All systems within the selected criteria are operating normally without security anomalies.
              </p>
              <button className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
                Clear All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
