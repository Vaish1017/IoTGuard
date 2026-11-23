// ==========================================================================
// IoTGuard — Sensors View (Real-time sensor readings & charts)
// ==========================================================================

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensorReadings, useNetworkTrafficHistory } from '../api';
import {
  IconActivity, IconNetwork, IconRefreshCw, IconDownload,
  IconSearch, IconCheckCircle, IconAlertTriangle, IconTarget,
  IconCpu, IconX, IconClock
} from '../components/Icons';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const SENSOR_COLORS: Record<string, string> = {
  network: 'var(--lavender)',
  device: 'var(--mint)',
  application: 'var(--coral)',
  gateway: 'var(--amber)',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(10, 14, 23, 0.96)',
          border: '1px solid rgba(184, 168, 240, 0.35)',
          borderRadius: 8,
          padding: '10px 14px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(184, 168, 240, 0.15)',
          backdropFilter: 'blur(16px)',
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          color: '#ffffff',
          minWidth: 170,
          zIndex: 1000,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--fg-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 4 }}>
          {label}
        </div>
        {payload.map((entry: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color || entry.fill }} />
              <span style={{ color: 'var(--fg-muted)', fontSize: 12 }}>{entry.name}</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: entry.color || '#fff' }}>
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              {entry.unit ? ` ${entry.unit}` : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function Sensors() {
  const { sensorReadings, refetch: refetchSensors } = useSensorReadings();
  const { history, refetch: refetchHistory } = useNetworkTrafficHistory();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'warning'>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('1h');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3200);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refetchSensors();
    refetchHistory();
    showToast('Sensor telemetry refreshed from backend');
    setTimeout(() => setIsRefreshing(false), 800);
  }, [refetchSensors, refetchHistory, showToast]);

  // Derived category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: sensorReadings.length, network: 0, application: 0, device: 0 };
    sensorReadings.forEach(s => {
      if (counts[s.type] !== undefined) {
        counts[s.type]++;
      } else {
        counts[s.type] = 1;
      }
    });
    return counts;
  }, [sensorReadings]);

  // KPI calculations
  const totalSensors = sensorReadings.length;
  const normalSensors = useMemo(() => sensorReadings.filter(s => s.status === 'online').length, [sensorReadings]);
  const warningSensors = useMemo(() => sensorReadings.filter(s => s.status === 'warning' || s.status === 'critical').length, [sensorReadings]);
  const avgUtilization = useMemo(() => {
    if (sensorReadings.length === 0) return 0;
    const sum = sensorReadings.reduce((acc, s) => acc + Math.min(100, (s.value / s.threshold) * 100), 0);
    return Math.round(sum / sensorReadings.length);
  }, [sensorReadings]);

  // Filtered sensor list
  const filteredSensors = useMemo(() => {
    return sensorReadings.filter(sensor => {
      const matchCategory = selectedCategory === 'all' || sensor.type.toLowerCase() === selectedCategory.toLowerCase();
      const matchStatus = statusFilter === 'all' || sensor.status.toLowerCase() === statusFilter.toLowerCase();
      const matchSearch = searchQuery.trim() === '' ||
        sensor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sensor.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sensor.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sensor.unit.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchStatus && matchSearch;
    });
  }, [sensorReadings, selectedCategory, statusFilter, searchQuery]);

  // Filtered history by time range
  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    if (timeRange === '1h') return history.slice(-12);
    if (timeRange === '6h') return history.slice(-20);
    return history;
  }, [history, timeRange]);

  // Bar chart data: Capacity & threshold utilization
  const barChartData = useMemo(() => {
    return sensorReadings.map(s => {
      const pct = Math.min(100, Math.round((s.value / s.threshold) * 100));
      return {
        name: s.name,
        utilization: pct,
        value: Number(s.value.toFixed(s.unit === 'bits' ? 1 : 0)),
        unit: s.unit,
        threshold: s.threshold,
        status: s.status,
        type: s.type,
      };
    });
  }, [sensorReadings]);

  // Pie chart data: Domain categories
  const pieChartData = useMemo(() => {
    return [
      { name: 'Network', value: categoryCounts.network || 0, color: 'var(--lavender)' },
      { name: 'Application', value: categoryCounts.application || 0, color: 'var(--coral)' },
      { name: 'Device Layer', value: categoryCounts.device || 0, color: 'var(--mint)' },
    ].filter(item => item.value > 0);
  }, [categoryCounts]);

  // CSV Export
  const handleExportCSV = useCallback(() => {
    const headers = ['Sensor ID', 'Name', 'Category', 'Status', 'Current Reading', 'Unit', 'Threshold', 'Utilization Pct', 'Location', 'Last Updated'];
    const rows = filteredSensors.map(s => {
      const utilPct = Math.min(100, Math.round((s.value / s.threshold) * 100));
      return [
        s.id,
        `"${s.name}"`,
        s.type,
        s.status,
        s.value.toFixed(s.unit === 'bits' ? 1 : 0),
        s.unit,
        s.threshold,
        `${utilPct}%`,
        `"${s.location}"`,
        s.lastUpdate,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `iotguard_sensors_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredSensors.length} sensor telemetry records`);
  }, [filteredSensors, showToast]);

  return (
    <div className="sensors-page-container">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="action-toast"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span className="toast-dot" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Row */}
      <div className="sensors-header-row">
        <div className="sensors-title-group">
          <h1>Sensors & Telemetry</h1>
          <p>Real-time sensor readings, network traffic, capacity utilization & anomaly telemetry</p>
        </div>
        <div className="sensors-header-actions">
          <motion.button
            className="btn btn-ghost btn-sm"
            onClick={handleRefresh}
            whileTap={{ scale: 0.95 }}
            title="Refresh telemetry streams"
          >
            <motion.span
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.8, ease: 'linear', repeat: isRefreshing ? Infinity : 0 }}
              style={{ display: 'inline-flex' }}
            >
              <IconRefreshCw size={14} strokeWidth={2} />
            </motion.span>
            Refresh
          </motion.button>
          <motion.button
            className="btn btn-ghost btn-sm"
            onClick={handleExportCSV}
            whileTap={{ scale: 0.95 }}
            title="Download CSV export"
          >
            <IconDownload size={14} strokeWidth={2} />
            Export CSV
          </motion.button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="sensors-kpi-grid">
        <motion.div
          className={`sensor-kpi-card total ${statusFilter === 'all' && selectedCategory === 'all' ? 'active-filter' : ''}`}
          onClick={() => { setStatusFilter('all'); setSelectedCategory('all'); }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="sensor-kpi-icon total">
            <IconNetwork size={22} strokeWidth={2} />
          </div>
          <div className="sensor-kpi-info">
            <div className="sensor-kpi-label">Total Monitored</div>
            <div className="sensor-kpi-val">{totalSensors}</div>
            <div className="sensor-kpi-sub">Active Telemetry Probes</div>
          </div>
        </motion.div>

        <motion.div
          className={`sensor-kpi-card online ${statusFilter === 'online' ? 'active-filter' : ''}`}
          onClick={() => setStatusFilter(prev => prev === 'online' ? 'all' : 'online')}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="sensor-kpi-icon online">
            <IconCheckCircle size={22} strokeWidth={2} />
          </div>
          <div className="sensor-kpi-info">
            <div className="sensor-kpi-label">Normal Operating</div>
            <div className="sensor-kpi-val" style={{ color: 'var(--mint)' }}>{normalSensors}</div>
            <div className="sensor-kpi-sub">Within Safe Thresholds</div>
          </div>
        </motion.div>

        <motion.div
          className={`sensor-kpi-card warning ${statusFilter === 'warning' ? 'active-filter' : ''}`}
          onClick={() => setStatusFilter(prev => prev === 'warning' ? 'all' : 'warning')}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="sensor-kpi-icon warning">
            <IconAlertTriangle size={22} strokeWidth={2} />
          </div>
          <div className="sensor-kpi-info">
            <div className="sensor-kpi-label">Warning State</div>
            <div className="sensor-kpi-val" style={{ color: 'var(--amber)' }}>{warningSensors}</div>
            <div className="sensor-kpi-sub">Approaching Limit</div>
          </div>
        </motion.div>

        <motion.div
          className="sensor-kpi-card rate"
          whileHover={{ y: -2 }}
        >
          <div className="sensor-kpi-icon rate">
            <IconTarget size={22} strokeWidth={2} />
          </div>
          <div className="sensor-kpi-info">
            <div className="sensor-kpi-label">Fleet Utilization</div>
            <div className="sensor-kpi-val" style={{ color: '#60a5fa' }}>{avgUtilization}%</div>
            <div className="sensor-kpi-sub">Average Capacity Load</div>
          </div>
        </motion.div>
      </div>

      {/* Toolbar & Filters Card */}
      <div className="sensors-toolbar-card">
        <div className="sensors-filters-left">
          <span className="sensors-filter-label">Category:</span>
          <div className="sensor-cat-chips">
            <button
              className={`sensor-chip ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Probes
              <span className="sensor-chip-count">{categoryCounts.all}</span>
            </button>
            <button
              className={`sensor-chip ${selectedCategory === 'network' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('network')}
            >
              Network
              <span className="sensor-chip-count">{categoryCounts.network || 0}</span>
            </button>
            <button
              className={`sensor-chip ${selectedCategory === 'application' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('application')}
            >
              Application
              <span className="sensor-chip-count">{categoryCounts.application || 0}</span>
            </button>
            <button
              className={`sensor-chip ${selectedCategory === 'device' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('device')}
            >
              Device
              <span className="sensor-chip-count">{categoryCounts.device || 0}</span>
            </button>
          </div>

          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{ width: 140, height: 38 }}
            aria-label="Filter sensors by status"
          >
            <option value="all">All Statuses</option>
            <option value="online">Normal Only</option>
            <option value="warning">Warning Only</option>
          </select>
        </div>

        <div className="sensors-controls-right">
          <div className="sensor-search-box">
            <span className="sensor-search-icon">
              <IconSearch size={14} strokeWidth={2} />
            </span>
            <input
              type="text"
              className="sensor-search-input"
              placeholder="Search sensors by name or host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="sensor-search-clear"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <IconX size={14} strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="sensor-view-modes">
            <button
              className={`sensor-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
              aria-label="Grid view"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button
              className={`sensor-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Table View"
              aria-label="List view"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Live Telemetry Chart */}
      <div className="glass-card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="card-title">Live Network & Security Telemetry Stream</div>
            <div className="card-subtitle">Real-time packets/sec, failed connections & anomaly score over time</div>
          </div>
          <div className="sensor-time-pills">
            {(['1h', '6h', '24h'] as const).map(range => (
              <button
                key={range}
                className={`sensor-time-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="card-content" style={{ paddingTop: 0 }}>
          <div className="chart-container" style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredHistory} margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="sensorPacketsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--lavender)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--lavender)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="sensorScoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--coral)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--coral)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="sensorFailedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--amber)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--amber)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} horizontal={true} strokeDasharray="4 4" stroke="var(--border)" opacity={0.6} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--fg-muted)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
                  dy={8}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--fg-muted)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                  width={46}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tick={{ fill: 'var(--fg-muted)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
                  tickFormatter={v => `${v}%`}
                  width={46}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 14 }}
                  iconType="circle"
                  iconSize={8}
                  formatter={(name) => (
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg)' }}>
                      {name === 'packets' ? 'Packets/sec (Throughput)' : name === 'score' ? 'Anomaly Score (%)' : 'Failed Connections'}
                    </span>
                  )}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="packets"
                  name="packets"
                  stroke="var(--lavender)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#sensorPacketsGrad)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="score"
                  name="score"
                  stroke="var(--coral)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#sensorScoreGrad)"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="failed"
                  name="failed"
                  stroke="var(--amber)"
                  strokeWidth={1.8}
                  fillOpacity={1}
                  fill="url(#sensorFailedGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Side-by-Side Charts Row: Utilization & Distribution */}
      <div className="sensors-charts-row">
        {/* Horizontal Bar Chart: Sensor Threshold Utilization */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <div className="card-title">Sensor Capacity & Threshold Utilization</div>
              <div className="card-subtitle">Percentage of configured threshold currently consumed</div>
            </div>
          </div>
          <div className="card-content" style={{ paddingTop: 0 }}>
            <div className="chart-container" style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  layout="vertical"
                  margin={{ top: 8, right: 28, left: 16, bottom: 8 }}
                >
                  <CartesianGrid vertical={true} horizontal={false} strokeDasharray="4 4" stroke="var(--border)" opacity={0.6} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--fg-muted)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
                    tickFormatter={v => `${v}%`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--fg-muted)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
                    width={130}
                  />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div style={{
                            background: 'rgba(10, 14, 23, 0.96)',
                            border: '1px solid rgba(184, 168, 240, 0.35)',
                            borderRadius: 8,
                            padding: '10px 14px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
                            fontSize: 12,
                            color: '#fff',
                          }}>
                            <div style={{ fontWeight: 600, color: 'var(--fg-muted)', fontSize: 11, marginBottom: 4 }}>
                              {item.name} ({item.type})
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                              <span>Current Reading:</span>
                              <span style={{ fontWeight: 700, color: '#fff' }}>{item.value} {item.unit}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                              <span>Max Threshold:</span>
                              <span style={{ color: 'var(--fg-muted)' }}>{item.threshold} {item.unit}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 4, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                              <span>Utilization:</span>
                              <span style={{
                                fontWeight: 700,
                                color: item.utilization >= 90 ? 'var(--coral)' : item.utilization >= 70 ? 'var(--amber)' : 'var(--mint)'
                              }}>
                                {item.utilization}%
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="utilization"
                    name="Capacity Used (%)"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={18}
                  >
                    {barChartData.map((entry, index) => {
                      const color = entry.utilization >= 90 ? 'var(--coral)' : entry.utilization >= 70 ? 'var(--amber)' : 'var(--mint)';
                      return <Cell key={`bar-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Donut Chart: Telemetry Probes by Domain */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <div className="card-title">Telemetry Probes by Domain</div>
              <div className="card-subtitle">Distribution of network, application & device layer probes</div>
            </div>
          </div>
          <div className="card-content" style={{ paddingTop: 0, position: 'relative' }}>
            <div className="chart-container" style={{ height: 240, width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`pie-${index}`} fill={entry.color} stroke="rgba(5, 7, 10, 0.8)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}>
                <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#ffffff', lineHeight: 1 }}>
                  {totalSensors}
                </div>
                <div style={{ fontSize: 10, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>
                  Total Probes
                </div>
              </div>
            </div>

            {/* Custom Domain Legend */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
              flexWrap: 'wrap',
              paddingTop: 8,
              borderTop: '1px solid var(--border-subtle)',
            }}>
              {pieChartData.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                  <span style={{ color: 'var(--fg-muted)' }}>{item.name}:</span>
                  <span style={{ fontWeight: 600, color: '#ffffff' }}>
                    {item.value} ({totalSensors > 0 ? Math.round((item.value / totalSensors) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Details Feed */}
      <div className="glass-card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div className="card-title">
              {viewMode === 'grid' ? 'Sensor Telemetry Feed' : 'Sensor Telemetry Table'}
            </div>
            <div className="card-subtitle">
              Showing {filteredSensors.length} of {totalSensors} active sensors
            </div>
          </div>
        </div>

        <div className="card-content" style={{ paddingTop: 0 }}>
          {filteredSensors.length === 0 ? (
            <div className="sensors-empty-state">
              <IconCpu size={36} strokeWidth={1.5} style={{ opacity: 0.4 }} />
              <h3>No sensors match your filter</h3>
              <p style={{ margin: 0, fontSize: 13 }}>
                Try adjusting your category, status, or search terms to see active probes.
              </p>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setSelectedCategory('all'); setStatusFilter('all'); setSearchQuery(''); }}
                style={{ marginTop: 8 }}
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="sensors-grid">
              {filteredSensors.map((sensor, index) => {
                const utilPct = Math.min(100, Math.round((sensor.value / sensor.threshold) * 100));
                const utilColor = utilPct >= 90 ? 'var(--coral)' : utilPct >= 70 ? 'var(--amber)' : 'var(--mint)';
                const utilClass = utilPct >= 90 ? 'critical' : utilPct >= 70 ? 'warning' : 'normal';

                return (
                  <motion.div
                    key={sensor.id}
                    className="sensor-detail-card"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ y: -2 }}
                  >
                    {/* Top Row: Category tag + Status Badge */}
                    <div className="sensor-card-top">
                      <span className={`sensor-cat-tag ${sensor.type}`}>
                        {sensor.type === 'network' && <IconNetwork size={12} strokeWidth={2} />}
                        {sensor.type === 'application' && <IconActivity size={12} strokeWidth={2} />}
                        {sensor.type === 'device' && <IconCpu size={12} strokeWidth={2} />}
                        {sensor.type}
                      </span>
                      <span className={`sensor-status-badge ${sensor.status}`}>
                        <span className="sensor-status-dot" />
                        {sensor.status === 'online' ? 'Normal' : 'Warning'}
                      </span>
                    </div>

                    {/* Sensor Name & Host Location */}
                    <div className="sensor-card-main">
                      <div className="sensor-name-text">{sensor.name}</div>
                      <div className="sensor-location-text">
                        <span>Host: {sensor.location}</span>
                      </div>
                    </div>

                    {/* Current Reading & Utilization */}
                    <div className="sensor-reading-row">
                      <div className="sensor-val-wrap">
                        <span className="sensor-big-val">
                          {sensor.value.toFixed(sensor.unit === 'bits' ? 1 : 0)}
                        </span>
                        <span className="sensor-unit-tag">{sensor.unit}</span>
                      </div>
                      <span className={`sensor-util-label ${utilClass}`}>
                        {utilPct}% capacity
                      </span>
                    </div>

                    {/* Gauge Progress Bar */}
                    <div className="sensor-gauge-track">
                      <motion.div
                        className="sensor-gauge-fill"
                        style={{
                          width: `${utilPct}%`,
                          background: utilColor,
                          boxShadow: `0 0 8px ${utilColor}66`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${utilPct}%` }}
                        transition={{ type: 'spring', stiffness: 90, delay: 0.1 + index * 0.04 }}
                      />
                    </div>

                    {/* Meta info footer */}
                    <div className="sensor-card-meta">
                      <div className="sensor-meta-badge">
                        <IconTarget size={12} strokeWidth={2} />
                        <span>Max: {sensor.threshold} {sensor.unit}</span>
                      </div>
                      <div className="sensor-meta-badge">
                        <IconClock size={12} strokeWidth={2} />
                        <span>{new Date(sensor.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sensor Probe</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Current Value</th>
                    <th style={{ textAlign: 'right' }}>Threshold</th>
                    <th>Capacity Utilization</th>
                    <th>Host Location</th>
                    <th>Last Telemetry</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSensors.map((sensor, index) => {
                    const utilPct = Math.min(100, Math.round((sensor.value / sensor.threshold) * 100));
                    const utilColor = utilPct >= 90 ? 'var(--coral)' : utilPct >= 70 ? 'var(--amber)' : 'var(--mint)';

                    return (
                      <motion.tr
                        key={sensor.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ backgroundColor: 'var(--bg-elevated)' }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: SENSOR_COLORS[sensor.type] || 'var(--lavender)'
                            }} />
                            <span style={{ fontWeight: 600, color: '#ffffff' }}>{sensor.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`sensor-cat-tag ${sensor.type}`} style={{ padding: '2px 6px', fontSize: 10 }}>
                            {sensor.type}
                          </span>
                        </td>
                        <td>
                          <span className={`sensor-status-badge ${sensor.status}`} style={{ padding: '2px 6px', fontSize: 10 }}>
                            <span className="sensor-status-dot" />
                            {sensor.status === 'online' ? 'Normal' : 'Warning'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#ffffff' }}>
                          {sensor.value.toFixed(sensor.unit === 'bits' ? 1 : 0)}
                          <span style={{ fontSize: 11, color: 'var(--fg-muted)', marginLeft: 4, fontWeight: 400 }}>{sensor.unit}</span>
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--fg-muted)', fontSize: 12 }}>
                          {sensor.threshold} {sensor.unit}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                            <div className="sensor-gauge-track" style={{ flex: 1 }}>
                              <div
                                className="sensor-gauge-fill"
                                style={{ width: `${utilPct}%`, background: utilColor }}
                              />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, color: utilColor, width: 34, textAlign: 'right' }}>
                              {utilPct}%
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{sensor.location}</td>
                        <td style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                          {new Date(sensor.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
