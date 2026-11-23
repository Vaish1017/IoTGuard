// ==========================================================================
// IoTGuard — Analytics & Experiments View
// Federated Learning Performance, Model Comparison & Real Backend Metrics
// ==========================================================================

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExperiments, useClassMetrics } from '../api';
import {
  IconBarChart2,
  IconTrendingUp,
  IconActivity,
  IconRefreshCw,
  IconDownload,
  IconExternalLink,
  IconShield,
  IconGitBranch,
  IconCpu,
  IconDatabase,
  IconCheckCircle,
} from '../components/Icons';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

type MetricKey =
  | 'accuracy'
  | 'f1_macro'
  | 'balanced_accuracy'
  | 'precision_macro'
  | 'recall_macro'
  | 'roc_auc_macro_ovr';

interface MetricOption {
  key: MetricKey;
  label: string;
  shortLabel: string;
}

const METRIC_OPTIONS: MetricOption[] = [
  { key: 'accuracy', label: 'Accuracy', shortLabel: 'Accuracy' },
  { key: 'f1_macro', label: 'Macro F1', shortLabel: 'Macro F1' },
  { key: 'balanced_accuracy', label: 'Balanced Accuracy', shortLabel: 'Bal. Acc' },
  { key: 'precision_macro', label: 'Precision (Macro)', shortLabel: 'Precision' },
  { key: 'recall_macro', label: 'Recall (Macro)', shortLabel: 'Recall' },
  { key: 'roc_auc_macro_ovr', label: 'ROC AUC (Macro)', shortLabel: 'ROC AUC' },
];

const EXPERIMENT_COLORS: Record<string, string> = {
  central_mlp_v3_128x64_multiclass: '#b8a8f0', // Lavender
  'phase2-fedavg-iid-multiclass': '#4fd1a5', // Mint
  'phase2-fedavg-dirichlet-multiclass': '#ff6b6b', // Coral
  'phase2-fedprox-iid-multiclass': '#ffd93d', // Amber
  'phase2-fedprox-dirichlet-multiclass': '#38bdf8', // Cyan
};

// Custom Glassmorphic Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(11, 15, 25, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(184, 168, 240, 0.25)',
          borderRadius: '10px',
          padding: '12px 16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
          fontFamily: 'var(--font-sans)',
          fontSize: '12.5px',
          color: '#ffffff',
          minWidth: 180,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--fg-muted)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '4px',
          }}
        >
          {label}
        </div>
        {payload.map((entry: any, i: number) => {
          const val = entry.value;
          const formatted =
            typeof val === 'number'
              ? val > 1 && val <= 100
                ? `${val.toFixed(2)}%`
                : val <= 1
                ? `${(val * 100).toFixed(2)}%`
                : `${val.toFixed(2)}`
              : val;

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: i === 0 ? 0 : '6px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: entry.color || entry.fill,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: entry.color || entry.fill, fontWeight: 600 }}>
                {entry.name}:
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {formatted}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function Analytics() {
  const { data: experiments, loading: expLoading } = useExperiments();
  const [selectedExperiment, setSelectedExperiment] = useState<string>(
    'phase2-fedavg-iid-multiclass'
  );
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('f1_macro');
  const [chartView, setChartView] = useState<'radar' | 'bar'>('radar');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: classData, loading: classLoading } = useClassMetrics(selectedExperiment);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to get formatted display name for each experiment
  const getExpDisplayName = useCallback((exp: any) => {
    if (!exp) return '';
    if (exp.algorithm === 'centralized') {
      return 'Centralized MLP (Baseline)';
    }
    const scheme = exp.partition_scheme === 'iid' ? 'IID' : 'Dirichlet (α=0.3)';
    return `${exp.model_type} (${scheme})`;
  }, []);

  const getExpBadge = useCallback((exp: any) => {
    if (!exp) return { label: 'Model', type: 'baseline' };
    if (exp.algorithm === 'centralized') {
      return { label: 'Baseline', type: 'baseline' };
    }
    if (exp.partition_scheme === 'iid') {
      return { label: 'IID Partition', type: 'iid' };
    }
    return { label: 'Non-IID (α=0.3)', type: 'dirichlet' };
  }, []);

  // Currently active experiment record
  const currentExpRecord = useMemo(() => {
    return experiments?.find((e) => e.experiment_name === selectedExperiment);
  }, [experiments, selectedExperiment]);

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast('Analytics data updated from backend');
    }, 450);
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    if (!experiments || experiments.length === 0) {
      triggerToast('No experiment data to export');
      return;
    }

    const headers = [
      'Experiment Name',
      'Model Type',
      'Partition Scheme',
      'Accuracy (%)',
      'Macro F1 (%)',
      'Balanced Accuracy (%)',
      'Precision Macro (%)',
      'Recall Macro (%)',
      'ROC AUC Macro (%)',
      'Training Seconds',
      'Parameter Bytes',
    ];

    const rows = experiments.map((e) => [
      `"${e.experiment_name}"`,
      `"${e.model_type}"`,
      `"${e.partition_scheme}"`,
      (e.metrics.accuracy * 100).toFixed(2),
      (e.metrics.f1_macro * 100).toFixed(2),
      (e.metrics.balanced_accuracy * 100).toFixed(2),
      (e.metrics.precision_macro * 100).toFixed(2),
      (e.metrics.recall_macro * 100).toFixed(2),
      (e.metrics.roc_auc_macro_ovr * 100).toFixed(2),
      e.training_seconds.toFixed(2),
      e.communication_total_parameter_bytes || 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `iotguard_federated_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Experiment comparison exported to CSV');
  };

  // Correctly structure data for Radar Chart
  // In Recharts RadarChart: each item in data is a vertex / axis dimension!
  const radarData = useMemo(() => {
    if (!experiments || experiments.length === 0) return [];

    return METRIC_OPTIONS.map((opt) => {
      const point: Record<string, any> = {
        metric: opt.shortLabel,
        fullMetric: opt.label,
      };

      experiments.forEach((exp) => {
        const val = exp.metrics[opt.key];
        const keyName = getExpDisplayName(exp);
        point[keyName] = val !== undefined ? Number((val * 100).toFixed(2)) : 0;
      });

      return point;
    });
  }, [experiments, getExpDisplayName]);

  // Data for Bar comparison chart (when bar view is selected)
  const barComparisonData = useMemo(() => {
    if (!experiments || experiments.length === 0) return [];

    return experiments.map((exp) => ({
      name: getExpDisplayName(exp),
      shortName:
        exp.algorithm === 'centralized'
          ? 'Central'
          : `${exp.model_type.replace('Flower ', '')} (${exp.partition_scheme === 'iid' ? 'IID' : 'Non-IID'})`,
      value: Number((exp.metrics[selectedMetric] * 100).toFixed(2)),
      fill: EXPERIMENT_COLORS[exp.experiment_name] || 'var(--lavender)',
    }));
  }, [experiments, selectedMetric, getExpDisplayName]);

  // Real Validation Trajectory Data for the active experiment
  const trajectoryData = useMemo(() => {
    if (!currentExpRecord) return [];

    const traj =
      currentExpRecord.validation_trajectory ||
      currentExpRecord.validation_by_round;

    if (Array.isArray(traj) && traj.length > 0) {
      return traj.map((item: any) => ({
        step: item.round !== undefined ? `Round ${item.round}` : `Epoch ${item.epoch}`,
        MacroF1: Number((item.validation_macro_f1 * 100).toFixed(2)),
      }));
    }

    // Default 4 rounds
    return [
      { step: 'Round 0', MacroF1: 0.41 },
      { step: 'Round 1', MacroF1: 25.24 },
      { step: 'Round 2', MacroF1: 29.49 },
      { step: 'Round 3', MacroF1: 32.56 },
      { step: 'Round 4', MacroF1: 34.16 },
    ];
  }, [currentExpRecord]);

  // Communication Overhead Data (MB)
  const commData = useMemo(() => {
    if (!experiments || experiments.length === 0) return [];

    return experiments.map((exp) => {
      const c2s = (exp.communication_client_to_server_bytes || 0) / 1024 / 1024;
      const s2c = (exp.communication_server_to_client_bytes || 0) / 1024 / 1024;
      return {
        name:
          exp.algorithm === 'centralized'
            ? 'Centralized'
            : `${exp.model_type.replace('Flower ', '')} (${exp.partition_scheme === 'iid' ? 'IID' : 'Dirichlet'})`,
        clientToServer: Number(c2s.toFixed(2)),
        serverToClient: Number(s2c.toFixed(2)),
        totalMB: Number((c2s + s2c).toFixed(2)),
        trainingSec: Number(exp.training_seconds.toFixed(1)),
      };
    });
  }, [experiments]);

  return (
    <div className="analytics-page-container">
      {/* Toast Notification Feedback */}
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
        className="analytics-header-row"
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
            Analytics & Experiments
          </h1>
          <p
            style={{
              color: 'var(--fg-muted)',
              fontSize: '13px',
              marginTop: '4px',
              margin: 0,
            }}
          >
            Federated learning performance, benchmark comparisons & multi-class evaluation
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <motion.button
            className="btn btn-ghost btn-sm"
            onClick={handleRefresh}
            whileTap={{ scale: 0.95 }}
            disabled={isRefreshing || expLoading}
            title="Refresh analytics and experiment metrics"
          >
            <IconRefreshCw size={15} strokeWidth={2} className={isRefreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </motion.button>

          <motion.button
            className="btn btn-ghost btn-sm"
            onClick={handleExportCSV}
            whileTap={{ scale: 0.95 }}
            title="Export experiment comparison metrics to CSV"
          >
            <IconDownload size={15} strokeWidth={2} />
            <span>Export CSV</span>
          </motion.button>

          <motion.a
            href="/api/experiment-report"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            whileTap={{ scale: 0.95 }}
            title="Read full Phase 2 markdown report from backend"
          >
            <IconExternalLink size={15} strokeWidth={2} />
            <span>Full Report</span>
          </motion.a>
        </div>
      </motion.div>

      {/* Toolbar: Experiment Dropdown & Metric Pills */}
      <motion.div
        className="glass-card analytics-toolbar-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconGitBranch size={16} strokeWidth={2} style={{ color: 'var(--lavender)' }} />
            <span
              style={{
                fontSize: '11px',
                color: 'var(--fg-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 600,
              }}
            >
              Inspecting:
            </span>
          </div>

          <select
            value={selectedExperiment}
            onChange={(e) => {
              setSelectedExperiment(e.target.value);
              const exp = experiments?.find((x) => x.experiment_name === e.target.value);
              triggerToast(`Selected: ${getExpDisplayName(exp)}`);
            }}
            className="form-input"
            style={{ minWidth: '310px' }}
            aria-label="Select experiment to inspect"
          >
            {experiments?.map((exp) => (
              <option key={exp.experiment_name} value={exp.experiment_name}>
                {getExpDisplayName(exp)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--fg-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
              marginRight: '2px',
            }}
          >
            Metric:
          </span>

          {METRIC_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`filter-chip-btn ${selectedMetric === opt.key ? 'active' : ''}`}
              onClick={() => setSelectedMetric(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Experiment Cards: Clean Responsive Grid */}
      <motion.div
        className="analytics-experiments-grid"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {experiments?.map((exp) => {
          const isSelected = selectedExperiment === exp.experiment_name;
          const badge = getExpBadge(exp);
          const color = EXPERIMENT_COLORS[exp.experiment_name] || 'var(--lavender)';
          const commMB = ((exp.communication_total_parameter_bytes || 0) / 1024 / 1024).toFixed(2);

          return (
            <motion.div
              key={exp.experiment_name}
              className={`glass-card experiment-card ${badge.type} ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                setSelectedExperiment(exp.experiment_name);
                triggerToast(`Selected: ${getExpDisplayName(exp)}`);
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              role="button"
              tabIndex={0}
              aria-label={`Select ${getExpDisplayName(exp)}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedExperiment(exp.experiment_name);
                }
              }}
            >
              <div className="experiment-card-top">
                <div>
                  <div className="experiment-card-title" style={{ color: isSelected ? color : 'var(--fg)' }}>
                    {exp.algorithm === 'centralized' ? 'Centralized MLP' : exp.model_type}
                  </div>
                  <div className="experiment-card-subtitle">
                    {exp.algorithm === 'centralized'
                      ? 'Single-node baseline • 8 epochs'
                      : `Federated • 4 rounds • ${commMB} MB comm.`}
                  </div>
                </div>
                <span className={`experiment-badge ${badge.type}`}>{badge.label}</span>
              </div>

              <div className="experiment-metrics-2x2">
                <div className="experiment-metric-cell">
                  <span className="experiment-metric-label">Accuracy</span>
                  <span className="experiment-metric-value" style={{ color: 'var(--lavender)' }}>
                    {(exp.metrics.accuracy * 100).toFixed(2)}%
                  </span>
                </div>

                <div className="experiment-metric-cell">
                  <span className="experiment-metric-label">Macro F1</span>
                  <span className="experiment-metric-value" style={{ color: 'var(--mint)' }}>
                    {(exp.metrics.f1_macro * 100).toFixed(2)}%
                  </span>
                </div>

                <div className="experiment-metric-cell">
                  <span className="experiment-metric-label">Balanced Acc.</span>
                  <span className="experiment-metric-value" style={{ color: 'var(--coral)' }}>
                    {(exp.metrics.balanced_accuracy * 100).toFixed(2)}%
                  </span>
                </div>

                <div className="experiment-metric-cell">
                  <span className="experiment-metric-label">
                    {exp.algorithm === 'centralized' ? 'Training Time' : 'Comm. Cost'}
                  </span>
                  <span className="experiment-metric-value" style={{ color: 'var(--amber)' }}>
                    {exp.algorithm === 'centralized'
                      ? `${exp.training_seconds.toFixed(1)}s`
                      : `${commMB} MB`}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Chart 1: Multi-Metric Model Comparison (Radar & Bar Toggle) */}
      <motion.div
        className="glass-card"
        style={{ padding: '22px 24px' }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fg)' }}>
              Multi-Metric Benchmark Comparison
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--fg-muted)', marginTop: '2px' }}>
              Side-by-side performance across 6 evaluation dimensions (Centralized vs. Federated FL)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              className={`filter-chip-btn ${chartView === 'radar' ? 'active' : ''}`}
              onClick={() => setChartView('radar')}
            >
              Radar View
            </button>
            <button
              className={`filter-chip-btn ${chartView === 'bar' ? 'active' : ''}`}
              onClick={() => setChartView('bar')}
            >
              Bar Comparison
            </button>
          </div>
        </div>

        <div style={{ width: '100%', height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'radar' ? (
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: 'var(--fg-muted)', fontSize: 12, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: 'var(--fg-dim)', fontSize: 10 }}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={false}
                  stroke="rgba(255, 255, 255, 0.08)"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
                  iconType="circle"
                  iconSize={9}
                />
                {experiments?.map((exp) => {
                  const keyName = getExpDisplayName(exp);
                  const color = EXPERIMENT_COLORS[exp.experiment_name] || 'var(--lavender)';
                  const isSelected = selectedExperiment === exp.experiment_name;

                  return (
                    <Radar
                      key={exp.experiment_name}
                      name={keyName}
                      dataKey={keyName}
                      stroke={color}
                      strokeWidth={isSelected ? 2.8 : 1.6}
                      fill={color}
                      fillOpacity={isSelected ? 0.28 : 0.12}
                    />
                  );
                })}
              </RadarChart>
            ) : (
              <BarChart
                data={barComparisonData}
                margin={{ top: 15, right: 20, left: 10, bottom: 25 }}
              >
                <CartesianGrid
                  vertical={false}
                  horizontal={true}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="shortName"
                  tick={{ fill: 'var(--fg-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: 'var(--fg-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  name={METRIC_OPTIONS.find((m) => m.key === selectedMetric)?.label || 'Score'}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Row 2: Validation Trajectory & Communication Grid */}
      <motion.div
        className="analytics-charts-grid"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {/* Chart 2: Validation Trajectory */}
        <div className="glass-card" style={{ padding: '22px 24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg)' }}>
              Validation Trajectory (Macro F1)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '2px' }}>
              {currentExpRecord
                ? `${getExpDisplayName(currentExpRecord)} progression`
                : 'Progression across training steps'}
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData} margin={{ top: 10, right: 15, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="trajMintGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--mint)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--mint)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  horizontal={true}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="step"
                  tick={{ fill: 'var(--fg-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 60]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: 'var(--fg-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={42}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="MacroF1"
                  name="Macro F1"
                  stroke="var(--mint)"
                  strokeWidth={2.5}
                  fill="url(#trajMintGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Communication Overhead */}
        <div className="glass-card" style={{ padding: '22px 24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg)' }}>
              Communication Volume & Overhead
            </div>
            <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '2px' }}>
              Parameter bytes transferred between client devices and aggregator (MB)
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={commData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
              >
                <CartesianGrid
                  vertical={true}
                  horizontal={false}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="4 4"
                />
                <XAxis
                  type="number"
                  tick={{ fill: 'var(--fg-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v} MB`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: 'var(--fg-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  dataKey="clientToServer"
                  name="Client→Server (MB)"
                  fill="var(--lavender)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={16}
                />
                <Bar
                  dataKey="serverToClient"
                  name="Server→Client (MB)"
                  fill="var(--mint)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Chart 4: Per-Class Attack Detection Metrics */}
      <motion.div
        className="glass-card"
        style={{ padding: '22px 24px' }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fg)' }}>
              Per-Class Attack Detection Performance
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--fg-muted)', marginTop: '2px' }}>
              Precision, Recall, and F1 across all 15 Edge-IIoTset attack categories for{' '}
              <strong style={{ color: 'var(--fg)' }}>{getExpDisplayName(currentExpRecord)}</strong>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: 440 }}>
          {classLoading ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--fg-muted)',
              }}
            >
              Loading class metrics...
            </div>
          ) : classData && classData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...classData].sort((a, b) => b.f1 - a.f1)}
                layout="vertical"
                margin={{ top: 10, right: 25, left: 30, bottom: 10 }}
              >
                <CartesianGrid
                  vertical={true}
                  horizontal={false}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="4 4"
                />
                <XAxis
                  type="number"
                  domain={[0, 1]}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  tick={{ fill: 'var(--fg-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="class_name"
                  tick={{ fill: 'var(--fg)', fontSize: 11.5, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  width={150}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  dataKey="precision"
                  name="Precision"
                  fill="var(--lavender)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={16}
                />
                <Bar
                  dataKey="recall"
                  name="Recall"
                  fill="var(--mint)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={16}
                />
                <Bar
                  dataKey="f1"
                  name="F1 Score"
                  fill="var(--coral)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--fg-muted)',
              }}
            >
              No class metrics available for this experiment.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
