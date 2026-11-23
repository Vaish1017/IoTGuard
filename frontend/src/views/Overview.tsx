// ==========================================================================
// IoTGuard — Overview View
// ==========================================================================

import { useOverview } from '../api';
import { IconDatabase, IconShieldCheck, IconActivity, IconTarget, IconAlertTriangle } from '../components/Icons';
import { MetricComparisonBar } from '../components/Charts';

export function Overview() {
  const { data, loading, error } = useOverview();

  const kpis = [
    { label: 'Test Samples', value: data?.test_rows?.toLocaleString() || '—', icon: IconDatabase },
    { label: 'Experiments', value: data?.experiment_count || '—', icon: IconShieldCheck },
    { label: 'Attack Classes', value: '15', icon: IconActivity },
    { label: 'Task Type', value: data?.task?.toUpperCase() || '—', icon: IconTarget },
  ];

  if (loading) return <div className="section" style={{height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-muted)'}}>Loading overview…</div>;
  if (error) return <div className="section glass-card" style={{textAlign: 'center', padding: 'var(--space-12)'}}><h3 style={{color: 'var(--danger)'}}>Failed to load</h3><p style={{marginTop: 'var(--space-2)', color: 'var(--fg-muted)'}}>{error.message}</p></div>;

  return (
    <div className="section">
      {/* Hero Section */}
      <div className="glass-card" style={{marginBottom: 'var(--space-6)'}}>
        <div className="card-content" style={{display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-8)', alignItems: 'center'}}>
          <div>
            <h1 style={{fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-4xl)', lineHeight: 1.1, marginBottom: 'var(--space-3)'}}>
              IoT Security <span style={{color: 'var(--accent)'}}>Observability</span>
            </h1>
            <p style={{fontSize: 'var(--text-lg)', color: 'var(--fg-muted)', maxWidth: 520}}>
              Federated learning experiment dashboard for Edge-IIoTset multiclass threat detection.
              Compare centralized vs. federated models, inspect per-class metrics, and monitor synthetic inference.
            </p>
            <div style={{marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap'}}>
              <span className="badge badge-accent">{data?.dataset}</span>
              <span className="badge badge-info">{data?.task}</span>
              <span className="badge badge-neutral">{data?.created_utc?.slice(0, 10)}</span>
            </div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-5xl)', color: 'var(--accent)', lineHeight: 1}}>
              {data?.experiment_count}
            </div>
            <div style={{fontSize: 'var(--text-sm)', color: 'var(--fg-muted)', marginTop: 'var(--space-1)'}}>
              Experiments Tracked
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{marginBottom: 'var(--space-6)'}}>
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className="glass-card kpi-card" style={{animationDelay: `${i * 60}ms`}}>
            <kpi.icon size={22} strokeWidth={2} aria-hidden="true" />
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Experiment Quick Compare */}
      <div className="glass-card" style={{marginBottom: 'var(--space-6)'}}>
        <div className="card-header">
          <div>
            <div className="card-title">Centralized vs. Federated — Key Metrics</div>
            <div className="card-subtitle">Phase 2 comparison on shared Edge-IIoTset test split</div>
          </div>
        </div>
        <div className="card-content">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)'}}>
            <MetricComparisonBar centralized={0.788} federated={0.816} label="Accuracy" unit="%" />
            <MetricComparisonBar centralized={0.442} federated={0.359} label="Balanced Accuracy" unit="%" />
            <MetricComparisonBar centralized={0.417} federated={0.348} label="Macro F1" unit="%" />
            <MetricComparisonBar centralized={0.900} federated={0.877} label="ROC AUC (Macro)" unit="%" />
            <MetricComparisonBar centralized={64.8} federated={0} label="Training Time" unit="s" />
            <MetricComparisonBar centralized={0} federated={12} label="Comm. Rounds" unit="" />
          </div>
        </div>
      </div>

      {/* Limitations / Disclosures */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title">Limitations & Disclosures</div>
          <div className="card-subtitle">Important context for interpreting these results</div>
        </div>
        <div className="card-content">
          <ul style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)'}}>
            {data?.limitations?.map((lim, i) => (
              <li key={i} style={{display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'}}>
                <IconAlertTriangle size={18} strokeWidth={2} style={{color: 'var(--warning)', flexShrink: 0, marginTop: '2px'}} aria-hidden="true" />
                <span style={{fontSize: 'var(--text-sm)', color: 'var(--fg)', lineHeight: 1.5}}>{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Metadata */}
      <div className="glass-card" style={{marginTop: 'var(--space-6)'}}>
        <div className="card-header">
          <div className="card-title">Model & Data Metadata</div>
        </div>
        <div className="card-content">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)'}}>
            <div><div className="stat-label">Architecture</div><div className="stat-value" style={{fontSize: 'var(--text-lg)'}}>128 × 64 MLP</div></div>
            <div><div className="stat-label">Feature Count</div><div className="stat-value" style={{fontSize: 'var(--text-lg)'}}>38 (transformed)</div></div>
            <div><div className="stat-label">Classes</div><div className="stat-value" style={{fontSize: 'var(--text-lg)'}}>15</div></div>
            <div><div className="stat-label">Checkpoint</div><div className="stat-value" style={{fontSize: 'var(--text-lg)', color: 'var(--danger)'}}>Not Bundled</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}