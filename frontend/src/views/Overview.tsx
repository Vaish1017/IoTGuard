// ==========================================================================
// IoTGuard — IoT Security Observability Dashboard View
// Balanced Spacing, Responsive Grid Hierarchy & Dark Cybersecurity Aesthetic
// ==========================================================================

import React from 'react';
import { useOverview } from '../api';
import {
  IconDatabase,
  IconShieldCheck,
  IconActivity,
  IconTarget,
  IconAlertTriangle,
} from '../components/Icons';

interface MetricItem {
  label: string;
  centralized: number;
  federated: number;
  unit: '%' | 's' | '';
  winner: 'centralized' | 'federated' | 'tie';
  diffText: string;
}

const COMPARISON_METRICS: MetricItem[] = [
  {
    label: 'Accuracy',
    centralized: 0.788,
    federated: 0.816,
    unit: '%',
    winner: 'federated',
    diffText: 'Federated +2.8%',
  },
  {
    label: 'Balanced Accuracy',
    centralized: 0.442,
    federated: 0.359,
    unit: '%',
    winner: 'centralized',
    diffText: 'Centralized +8.3%',
  },
  {
    label: 'Macro F1',
    centralized: 0.417,
    federated: 0.348,
    unit: '%',
    winner: 'centralized',
    diffText: 'Centralized +6.9%',
  },
  {
    label: 'ROC AUC (Macro)',
    centralized: 0.900,
    federated: 0.877,
    unit: '%',
    winner: 'centralized',
    diffText: 'Centralized +2.3%',
  },
  {
    label: 'Training Time',
    centralized: 64.8,
    federated: 0,
    unit: 's',
    winner: 'federated',
    diffText: 'Federated Faster',
  },
  {
    label: 'Comm. Rounds',
    centralized: 0,
    federated: 12,
    unit: '',
    winner: 'tie',
    diffText: '4 Rounds / 3 Clients',
  },
];

export function Overview() {
  const { data, loading, error } = useOverview();

  const kpiItems = [
    {
      label: 'Test Samples',
      value: data?.test_rows ? data.test_rows.toLocaleString() : '332,876',
      icon: IconDatabase,
      iconClass: 'overview-kpi-icon-cyan',
    },
    {
      label: 'Experiments',
      value: data?.experiment_count ?? 5,
      icon: IconShieldCheck,
      iconClass: 'overview-kpi-icon-purple',
    },
    {
      label: 'Attack Classes',
      value: '15',
      icon: IconActivity,
      iconClass: 'overview-kpi-icon-mint',
    },
    {
      label: 'Task Type',
      value: (data?.task || 'multiclass').toUpperCase(),
      icon: IconTarget,
      iconClass: 'overview-kpi-icon-amber',
    },
  ];

  if (loading) {
    return (
      <div
        className="overview-dashboard-container"
        style={{
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--fg-muted)',
        }}
      >
        <span>Loading observability dashboard…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="overview-dashboard-container overview-section-card"
        style={{ textAlign: 'center', padding: '40px' }}
      >
        <h3 style={{ color: 'var(--danger)' }}>Failed to load dashboard data</h3>
        <p style={{ marginTop: '8px', color: 'var(--fg-muted)' }}>{error.message}</p>
      </div>
    );
  }

  const formatMetric = (val: number, unit: string) => {
    if (unit === '%') return (val * 100).toFixed(1) + '%';
    if (unit === 's') return val > 0 ? `${val.toFixed(1)}s` : '0s (sim)';
    return val.toString();
  };

  return (
    <div className="overview-dashboard-container">
      {/* 1. Header Hero Section */}
      <section className="overview-hero-card">
        <div className="overview-hero-grid">
          <div className="overview-hero-left">
            <h1 className="overview-title">
              IoT Security <span className="overview-title-accent">Observability</span>
            </h1>
            <p className="overview-description">
              Federated learning experiment dashboard for Edge-IIoTset multiclass threat detection.
              Compare centralized vs. federated models, inspect per-class metrics, and monitor
              synthetic inference.
            </p>
            <div className="overview-meta-badges">
              <span className="overview-badge overview-badge-accent">
                {data?.dataset || 'Edge-IIoTset Phase 1 v3 processed split'}
              </span>
              <span className="overview-badge overview-badge-cyan">
                {data?.task || 'multiclass'}
              </span>
              <span className="overview-badge">
                {data?.created_utc ? data.created_utc.slice(0, 10) : '2026-11-20'}
              </span>
            </div>
          </div>

          <div className="overview-counter-card">
            <span className="overview-counter-num">
              {data?.experiment_count ?? 5}
            </span>
            <span className="overview-counter-label">Experiments Tracked</span>
          </div>
        </div>
      </section>

      {/* 2. Four Horizontally Aligned KPI Cards */}
      <section className="overview-kpi-grid" aria-label="Key Performance Indicators">
        {kpiItems.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="overview-kpi-card">
              <div className={`overview-kpi-icon-box ${kpi.iconClass}`}>
                <Icon size={22} strokeWidth={2.2} />
              </div>
              <div className="overview-kpi-content">
                <div className="overview-kpi-val tech-mono">{kpi.value}</div>
                <div className="overview-kpi-lbl">{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Centralized vs. Federated — Key Metrics */}
      <section className="overview-section-card" aria-label="Model Comparison Metrics">
        <div className="overview-card-header">
          <div>
            <h2 className="overview-card-title">Centralized vs. Federated — Key Metrics</h2>
            <p className="overview-card-subtitle">
              Phase 2 comparison on shared Edge-IIoTset test split
            </p>
          </div>
          <div className="overview-legend-row">
            <div className="overview-legend-item" style={{ color: '#38bdf8' }}>
              <span className="overview-legend-dot" style={{ background: '#38bdf8' }} />
              <span>Centralized</span>
            </div>
            <div className="overview-legend-item" style={{ color: '#c4b5fd' }}>
              <span className="overview-legend-dot" style={{ background: '#a855f7' }} />
              <span>Federated</span>
            </div>
          </div>
        </div>

        <div className="overview-compare-grid">
          {COMPARISON_METRICS.map((metric) => {
            const maxVal = Math.max(metric.centralized, metric.federated, 0.001);
            const centPct = Math.min(100, Math.max(0, (metric.centralized / maxVal) * 100));
            const fedPct = Math.min(100, Math.max(0, (metric.federated / maxVal) * 100));

            return (
              <div key={metric.label} className="overview-metric-box">
                <div className="overview-metric-header">
                  <span className="overview-metric-name">{metric.label}</span>
                  <span
                    className="overview-metric-winner"
                    style={{
                      background:
                        metric.winner === 'federated'
                          ? 'rgba(167, 139, 250, 0.14)'
                          : metric.winner === 'centralized'
                          ? 'rgba(56, 189, 248, 0.14)'
                          : 'rgba(255, 255, 255, 0.06)',
                      color:
                        metric.winner === 'federated'
                          ? '#c4b5fd'
                          : metric.winner === 'centralized'
                          ? '#38bdf8'
                          : 'var(--fg-muted)',
                    }}
                  >
                    {metric.diffText}
                  </span>
                </div>

                <div className="overview-bar-group">
                  {/* Centralized Row */}
                  <div className="overview-bar-row">
                    <span className="overview-bar-tag" style={{ color: '#38bdf8' }}>
                      Centralized
                    </span>
                    <div className="overview-bar-track">
                      <div
                        className="overview-bar-fill"
                        style={{ width: `${centPct}%`, background: '#38bdf8' }}
                      />
                    </div>
                    <span className="overview-bar-val" style={{ color: '#38bdf8' }}>
                      {formatMetric(metric.centralized, metric.unit)}
                    </span>
                  </div>

                  {/* Federated Row */}
                  <div className="overview-bar-row">
                    <span className="overview-bar-tag" style={{ color: '#c4b5fd' }}>
                      Federated
                    </span>
                    <div className="overview-bar-track">
                      <div
                        className="overview-bar-fill"
                        style={{ width: `${fedPct}%`, background: '#a855f7' }}
                      />
                    </div>
                    <span className="overview-bar-val" style={{ color: '#c4b5fd' }}>
                      {formatMetric(metric.federated, metric.unit)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Limitations & Disclosures: 2-Column Responsive Layout */}
      <section className="overview-section-card" aria-label="Limitations and Disclosures">
        <div className="overview-card-header">
          <div>
            <h2 className="overview-card-title">Limitations & Disclosures</h2>
            <p className="overview-card-subtitle">
              Important context for interpreting these results
            </p>
          </div>
        </div>

        <div className="overview-disclosures-grid">
          {(data?.limitations && data.limitations.length > 0
            ? data.limitations
            : [
                'Federated results come from a single-machine simulation over partitions of the same dataset.',
                'Differential privacy and secure aggregation are not implemented.',
                'Estimated tensor traffic is not measured network traffic.',
                'The saved row-level test split does not establish generalization to unseen captures, devices, or organizations.',
                'No trained inference checkpoint or live packet feed is bundled with this dashboard.',
              ]
          ).map((lim, i) => (
            <div key={i} className="overview-disclosure-item">
              <IconAlertTriangle
                size={18}
                strokeWidth={2.2}
                className="overview-disclosure-icon"
                aria-hidden="true"
              />
              <span className="overview-disclosure-text">{lim}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Model & Data Metadata: 4 Aligned Cards */}
      <section className="overview-section-card" aria-label="Model and Data Metadata">
        <div className="overview-card-header">
          <div>
            <h2 className="overview-card-title">Model & Data Metadata</h2>
            <p className="overview-card-subtitle">Verified feature policy and neural architecture</p>
          </div>
        </div>

        <div className="overview-metadata-grid">
          <div className="overview-meta-card">
            <span className="overview-meta-label">Architecture</span>
            <span className="overview-meta-val tech-mono">128 × 64 MLP</span>
          </div>
          <div className="overview-meta-card">
            <span className="overview-meta-label">Feature Count</span>
            <span className="overview-meta-val tech-mono">38 (transformed)</span>
          </div>
          <div className="overview-meta-card">
            <span className="overview-meta-label">Classes</span>
            <span className="overview-meta-val tech-mono">15</span>
          </div>
          <div className="overview-meta-card">
            <span className="overview-meta-label">Checkpoint</span>
            <span className="overview-meta-badge-warning">Not Bundled</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Overview;
