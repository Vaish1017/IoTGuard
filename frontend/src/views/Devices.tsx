// ==========================================================================
// IoTGuard — Connected Devices View
// Clean 4-KPI Horizontal Cards, Unified Toolbar, Responsive Grid/List Views
// ==========================================================================

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIoTDevices } from '../api';
import type { IoTDevice } from '../types';
import {
  IconServer,
  IconCpu,
  IconRouter,
  IconSensor,
  IconFilter,
  IconRefreshCw,
  IconDownload,
  IconPlus,
  IconSearch,
  IconX,
  IconCheckCircle,
  IconAlertTriangle,
  IconActivity,
  IconSettings,
  IconMoreHorizontal,
} from '../components/Icons';

type DeviceStatus = 'online' | 'warning' | 'offline' | 'maintenance';

const DEVICE_TYPE_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
> = {
  'Hospital Gateway': IconServer,
  'Industrial Controller': IconCpu,
  'Building Hub': IconRouter,
  'Edge Gateway': IconSensor,
};

const DEVICE_TYPE_COLORS: Record<string, string> = {
  'Hospital Gateway': 'var(--lavender)',
  'Industrial Controller': 'var(--mint)',
  'Building Hub': 'var(--amber)',
  'Edge Gateway': 'var(--coral)',
};

const STATUS_CONFIG: Record<
  DeviceStatus,
  {
    label: string;
    color: string;
    bg: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
    subtext: string;
  }
> = {
  online: {
    label: 'Online',
    color: 'var(--mint)',
    bg: 'var(--mint-dim)',
    icon: IconCheckCircle,
    subtext: 'Operating normally',
  },
  warning: {
    label: 'Warning',
    color: 'var(--amber)',
    bg: 'var(--amber-dim)',
    icon: IconAlertTriangle,
    subtext: 'Elevated anomaly rate',
  },
  offline: {
    label: 'Offline',
    color: 'var(--fg-subtle)',
    bg: 'rgba(138, 154, 181, 0.12)',
    icon: IconActivity,
    subtext: 'No active telemetry',
  },
  maintenance: {
    label: 'Maintenance',
    color: 'var(--lavender)',
    bg: 'var(--lavender-dim)',
    icon: IconSettings,
    subtext: 'Diagnostics & update',
  },
};

export function Devices() {
  const {
    devices,
    updateDeviceStatus,
    addDevice,
    refetch,
    loading,
  } = useIoTDevices();

  const [filterStatus, setFilterStatus] = useState<'all' | DeviceStatus>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'type' | 'lastSeen' | 'ip'>('name');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Device Form State
  const [newDevName, setNewDevName] = useState('');
  const [newDevType, setNewDevType] = useState('Edge Gateway');
  const [newDevLocation, setNewDevLocation] = useState('Edge Network');
  const [newDevIP, setNewDevIP] = useState('192.168.1.150');
  const [newDevStatus, setNewDevStatus] = useState<DeviceStatus>('online');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Distinct device types for the dropdown
  const deviceTypes = useMemo(() => {
    const types = new Set(devices.map((d) => d.type));
    return Array.from(types);
  }, [devices]);

  // Status counts for the 4 horizontal KPI summary cards
  const statusCounts = useMemo(() => {
    return {
      online: devices.filter((d) => d.status === 'online').length,
      warning: devices.filter((d) => d.status === 'warning').length,
      offline: devices.filter((d) => d.status === 'offline').length,
      maintenance: devices.filter((d) => d.status === 'maintenance').length,
    };
  }, [devices]);

  // Filtered and sorted devices list
  const filteredDevices = useMemo(() => {
    return devices
      .filter((device) => {
        if (filterStatus !== 'all' && device.status !== filterStatus) return false;
        if (filterType !== 'all' && device.type !== filterType) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = device.name.toLowerCase().includes(q);
          const matchIP = device.ipAddress.includes(q);
          const matchType = device.type.toLowerCase().includes(q);
          const matchLoc = device.location.toLowerCase().includes(q);
          if (!matchName && !matchIP && !matchType && !matchLoc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        if (sortBy === 'type') return a.type.localeCompare(b.type);
        if (sortBy === 'ip') return a.ipAddress.localeCompare(b.ipAddress);
        return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
      });
  }, [devices, filterStatus, filterType, search, sortBy]);

  // Handle Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refetch) await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast('Device fleet telemetry synchronized');
    }, 450);
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    if (filteredDevices.length === 0) {
      triggerToast('No devices to export');
      return;
    }

    const headers = [
      'Device ID',
      'Device Name',
      'Type',
      'Status',
      'IP Address',
      'Firmware',
      'Location',
      'Sensors',
      'Last Seen',
    ];

    const rows = filteredDevices.map((d) => [
      `"${d.id}"`,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.type}"`,
      `"${d.status.toUpperCase()}"`,
      `"${d.ipAddress}"`,
      `"${d.firmware}"`,
      `"${d.location.replace(/"/g, '""')}"`,
      d.sensorCount,
      `"${d.lastSeen}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `iotguard_connected_devices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`Exported ${filteredDevices.length} devices to CSV`);
  };

  // Handle Add Device Submit
  const handleAddDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevName.trim()) {
      triggerToast('Device name is required');
      return;
    }

    addDevice({
      name: newDevName.trim(),
      type: newDevType,
      location: newDevLocation.trim() || 'Edge Network',
      ipAddress: newDevIP.trim() || '192.168.1.100',
      status: newDevStatus,
      firmware: '2.1.0',
      sensorCount: 4,
    });

    setIsAddModalOpen(false);
    triggerToast(`Device "${newDevName.trim()}" registered`);
    setNewDevName('');
  };

  // Quick Status Toggle for actions
  const handleToggleStatus = (device: IoTDevice) => {
    const nextStatusMap: Record<DeviceStatus, DeviceStatus> = {
      online: 'maintenance',
      maintenance: 'offline',
      offline: 'warning',
      warning: 'online',
    };
    const next = nextStatusMap[device.status];
    updateDeviceStatus(device.id, next);
    triggerToast(`${device.name} status changed to ${next.toUpperCase()}`);
  };

  const handleResetFilters = () => {
    setFilterStatus('all');
    setFilterType('all');
    setSearch('');
    setSortBy('name');
  };

  return (
    <div className="devices-page-container">
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
        className="devices-header-row"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '26px',
              margin: 0,
            }}
          >
            Connected Devices
          </h1>
          <p
            style={{
              color: 'var(--fg-muted)',
              fontSize: '13px',
              marginTop: '4px',
              margin: 0,
            }}
          >
            IoT device inventory, status monitoring & fleet management ({devices.length} total registered)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <motion.button
            className="btn btn-ghost btn-sm"
            onClick={handleRefresh}
            whileTap={{ scale: 0.95 }}
            disabled={isRefreshing || loading}
            title="Synchronize device list with backend telemetry"
          >
            <IconRefreshCw size={15} strokeWidth={2} className={isRefreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </motion.button>

          <motion.button
            className="btn btn-ghost btn-sm"
            onClick={handleExportCSV}
            whileTap={{ scale: 0.95 }}
            title="Download device inventory as CSV"
          >
            <IconDownload size={15} strokeWidth={2} />
            <span>Export CSV</span>
          </motion.button>

          <motion.button
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddModalOpen(true)}
            whileTap={{ scale: 0.95 }}
            title="Register a new IoT edge device"
          >
            <IconPlus size={15} strokeWidth={2.2} />
            <span>Add Device</span>
          </motion.button>
        </div>
      </motion.div>

      {/* 4 Horizontally Aligned Status Summary Cards */}
      <motion.div
        className="devices-kpi-grid"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        {(['online', 'warning', 'offline', 'maintenance'] as const).map((status) => {
          const cfg = STATUS_CONFIG[status];
          const count = statusCounts[status];
          const isSelected = filterStatus === status;
          const Icon = cfg.icon;

          return (
            <motion.div
              key={status}
              className={`glass-card device-kpi-card ${isSelected ? 'selected-filter' : ''}`}
              onClick={() => setFilterStatus(isSelected ? 'all' : status)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              role="button"
              tabIndex={0}
              aria-label={`Filter by ${cfg.label} status (${count} devices)`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setFilterStatus(isSelected ? 'all' : status);
                }
              }}
            >
              <div
                className="device-kpi-icon"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                <Icon size={22} strokeWidth={2} />
              </div>
              <div className="device-kpi-info">
                <span className="device-kpi-value" style={{ color: cfg.color }}>
                  {count}
                </span>
                <span className="device-kpi-label">
                  {cfg.label}
                  {isSelected && (
                    <span style={{ marginLeft: '4px', color: 'var(--lavender)' }}>• Active</span>
                  )}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Unified Toolbar: Filters, Type Dropdown, Search, Sort & View Toggle */}
      <motion.div
        className="glass-card devices-toolbar-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="devices-filter-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
            <IconFilter size={15} strokeWidth={2} style={{ color: 'var(--fg-muted)' }} />
            <span
              style={{
                fontSize: '11px',
                color: 'var(--fg-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 600,
              }}
            >
              Filters:
            </span>
          </div>

          {(['all', 'online', 'warning', 'offline', 'maintenance'] as const).map((st) => (
            <button
              key={st}
              className={`filter-chip-btn ${filterStatus === st ? 'active' : ''}`}
              onClick={() => setFilterStatus(st)}
            >
              {st === 'all' ? 'All Status' : st.charAt(0).toUpperCase() + st.slice(1)}
              {st !== 'all' && statusCounts[st] > 0 && ` (${statusCounts[st]})`}
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

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-input"
            style={{ minWidth: '150px', height: '36px', fontSize: '12.5px' }}
            aria-label="Filter devices by type"
          >
            <option value="all">All Types</option>
            {deviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="devices-controls-right">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="form-input"
            style={{ minWidth: '145px', height: '36px', fontSize: '12.5px' }}
            aria-label="Sort devices by"
          >
            <option value="name">Sort: Name</option>
            <option value="status">Sort: Status</option>
            <option value="type">Sort: Type</option>
            <option value="ip">Sort: IP Address</option>
            <option value="lastSeen">Sort: Last Seen</option>
          </select>

          <div className="devices-search-box">
            <IconSearch size={15} strokeWidth={2} className="devices-search-icon" />
            <input
              type="text"
              placeholder="Search devices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search devices by name, IP, or location"
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

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
              aria-label="Switch to Grid View"
              style={{ padding: '6px 10px' }}
            >
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
              onClick={() => setViewMode('table')}
              title="Table View"
              aria-label="Switch to Table View"
              style={{ padding: '6px 10px' }}
            >
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Device Count & Active Filters Indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 4px',
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--fg-muted)' }}>
          Showing <strong style={{ color: 'var(--fg)' }}>{filteredDevices.length}</strong> of{' '}
          {devices.length} devices
          {filterStatus !== 'all' && ` • Filtered by ${filterStatus}`}
          {filterType !== 'all' && ` • ${filterType}`}
          {search && ` • Matching "${search}"`}
        </span>

        {(filterStatus !== 'all' || filterType !== 'all' || search) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleResetFilters}
            style={{ fontSize: '12px' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Devices Presentation: Grid vs. Table */}
      <AnimatePresence mode="wait">
        {filteredDevices.length > 0 ? (
          viewMode === 'grid' ? (
            <motion.div
              key="grid-view"
              className="devices-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {filteredDevices.map((device) => {
                const IconComp = DEVICE_TYPE_ICONS[device.type] || IconSensor;
                const typeColor = DEVICE_TYPE_COLORS[device.type] || 'var(--lavender)';
                const statusCfg = STATUS_CONFIG[device.status];

                return (
                  <motion.div
                    key={device.id}
                    className="glass-card device-card"
                    whileHover={{ y: -3 }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Header */}
                    <div className="device-card-header">
                      <div
                        className="device-avatar-icon"
                        style={{
                          background: `${typeColor}20`,
                          color: typeColor,
                          border: `1px solid ${typeColor}35`,
                        }}
                      >
                        <IconComp size={22} strokeWidth={2} />
                      </div>

                      <div className="device-title-info">
                        <span className="device-card-title" title={device.name}>
                          {device.name}
                        </span>
                        <span className="device-card-subtitle">
                          {device.type} • {device.location}
                        </span>
                      </div>

                      <span className={`device-status-badge ${device.status}`}>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: statusCfg.color,
                            display: 'inline-block',
                          }}
                        />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* 2x2 Meta Grid */}
                    <div className="device-meta-grid-2x2">
                      <div className="device-meta-cell">
                        <span className="device-meta-label">IP Address</span>
                        <span
                          className="device-meta-value"
                          style={{ fontFamily: 'monospace', letterSpacing: '-0.02em' }}
                        >
                          {device.ipAddress}
                        </span>
                      </div>

                      <div className="device-meta-cell">
                        <span className="device-meta-label">Firmware</span>
                        <span className="device-meta-value">v{device.firmware}</span>
                      </div>

                      <div className="device-meta-cell">
                        <span className="device-meta-label">Active Sensors</span>
                        <span className="device-meta-value">{device.sensorCount} Sensors</span>
                      </div>

                      <div className="device-meta-cell">
                        <span className="device-meta-label">Last Activity</span>
                        <span className="device-meta-value">
                          {new Date(device.lastSeen).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="device-card-footer">
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={() => triggerToast(`Monitoring active for ${device.name}`)}
                        title="Open device telemetry monitor"
                      >
                        <IconActivity size={13} strokeWidth={2} />
                        <span>Monitor</span>
                      </button>

                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={() => triggerToast(`Configuring ${device.name}`)}
                        title="Configure device settings"
                      >
                        <IconSettings size={13} strokeWidth={2} />
                        <span>Config</span>
                      </button>

                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleToggleStatus(device)}
                        title={`Cycle status (currently ${device.status})`}
                        style={{ padding: '6px 10px' }}
                      >
                        <IconMoreHorizontal size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="table-view"
              className="glass-card"
              style={{ padding: '0px', overflow: 'hidden' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Device Name</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>IP Address</th>
                      <th>Location</th>
                      <th>Firmware</th>
                      <th>Sensors</th>
                      <th>Last Seen</th>
                      <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevices.map((device) => {
                      const IconComp = DEVICE_TYPE_ICONS[device.type] || IconSensor;
                      const typeColor = DEVICE_TYPE_COLORS[device.type] || 'var(--lavender)';
                      const statusCfg = STATUS_CONFIG[device.status];

                      return (
                        <tr key={device.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 8,
                                  background: `${typeColor}20`,
                                  color: typeColor,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <IconComp size={16} strokeWidth={2} />
                              </div>
                              <span style={{ fontWeight: 600, color: 'var(--fg)' }}>
                                {device.name}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span style={{ color: typeColor, fontWeight: 500, fontSize: '13px' }}>
                              {device.type}
                            </span>
                          </td>
                          <td>
                            <span className={`device-status-badge ${device.status}`}>
                              <span
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: '50%',
                                  background: statusCfg.color,
                                  display: 'inline-block',
                                }}
                              />
                              {statusCfg.label}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '12.5px' }}>
                            {device.ipAddress}
                          </td>
                          <td style={{ fontSize: '12.5px', color: 'var(--fg-muted)' }}>
                            {device.location}
                          </td>
                          <td style={{ fontSize: '12.5px' }}>v{device.firmware}</td>
                          <td style={{ fontWeight: 600 }}>{device.sensorCount}</td>
                          <td style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                            {new Date(device.lastSeen).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div
                              style={{
                                display: 'inline-flex',
                                gap: '4px',
                                justifyContent: 'flex-end',
                              }}
                            >
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => triggerToast(`Monitoring ${device.name}`)}
                                title="Monitor"
                                style={{ padding: '4px 8px' }}
                              >
                                <IconActivity size={13} />
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleToggleStatus(device)}
                                title="Toggle Status"
                                style={{ padding: '4px 8px' }}
                              >
                                <IconSettings size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )
        ) : (
          <motion.div
            key="empty-state"
            className="glass-card"
            style={{ padding: '48px 24px', textAlign: 'center' }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <IconServer
              size={52}
              strokeWidth={1.5}
              style={{ color: 'var(--lavender)', opacity: 0.6, marginBottom: '12px' }}
            />
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--fg)' }}>
              No Devices Matching Current Criteria
            </div>
            <p
              style={{
                color: 'var(--fg-muted)',
                fontSize: '13px',
                maxWidth: '400px',
                margin: '6px auto 16px',
              }}
            >
              Try adjusting your search query, status filters, or selected device types.
            </p>
            <button className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
              Clear All Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Device Modal Dialog */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div
            className="device-modal-backdrop"
            onClick={() => setIsAddModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.div
              className="device-modal-dialog"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
            >
              <div className="device-modal-header">
                <div>
                  <h3
                    id="modal-title"
                    style={{
                      margin: 0,
                      fontSize: '17px',
                      fontWeight: 700,
                      color: 'var(--fg)',
                    }}
                  >
                    Register IoT Device
                  </h3>
                  <p
                    style={{
                      margin: '3px 0 0',
                      fontSize: '12px',
                      color: 'var(--fg-muted)',
                    }}
                  >
                    Add a new device node to the IoTGuard monitoring inventory
                  </p>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: 6, borderRadius: '50%' }}
                  aria-label="Close modal"
                >
                  <IconX size={16} />
                </button>
              </div>

              <form onSubmit={handleAddDeviceSubmit}>
                <div className="device-modal-body">
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--fg-muted)',
                        marginBottom: '6px',
                      }}
                    >
                      Device Name *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Warehouse Temp Sensor 04"
                      value={newDevName}
                      onChange={(e) => setNewDevName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--fg-muted)',
                          marginBottom: '6px',
                        }}
                      >
                        Device Type
                      </label>
                      <select
                        className="form-input"
                        style={{ width: '100%' }}
                        value={newDevType}
                        onChange={(e) => setNewDevType(e.target.value)}
                      >
                        <option value="Hospital Gateway">Hospital Gateway</option>
                        <option value="Industrial Controller">Industrial Controller</option>
                        <option value="Building Hub">Building Hub</option>
                        <option value="Edge Gateway">Edge Gateway</option>
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--fg-muted)',
                          marginBottom: '6px',
                        }}
                      >
                        Initial Status
                      </label>
                      <select
                        className="form-input"
                        style={{ width: '100%' }}
                        value={newDevStatus}
                        onChange={(e) => setNewDevStatus(e.target.value as DeviceStatus)}
                      >
                        <option value="online">Online</option>
                        <option value="warning">Warning</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--fg-muted)',
                          marginBottom: '6px',
                        }}
                      >
                        IP Address
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ width: '100%', fontFamily: 'monospace' }}
                        placeholder="192.168.1.150"
                        value={newDevIP}
                        onChange={(e) => setNewDevIP(e.target.value)}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--fg-muted)',
                          marginBottom: '6px',
                        }}
                      >
                        Location / Segment
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ width: '100%' }}
                        placeholder="e.g. Building C Floor 2"
                        value={newDevLocation}
                        onChange={(e) => setNewDevLocation(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="device-modal-footer">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Register Device
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
