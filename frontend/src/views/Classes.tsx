// ==========================================================================
// IoTGuard — Per-Class Metrics View
// ==========================================================================

import { useState, useMemo } from 'react';
import { useExperiments, useClassMetrics } from '../api';
import { ClassMetricsBarChart } from '../components/Charts';
import { IconActivity, IconTarget, IconArrowUpRight, IconArrowDownRight, IconSearch } from '../components/Icons';
import { IconZap } from '../components/Icons';

const METRIC_OPTIONS = [
  { key: 'f1', label: 'F1 Score' },
  { key: 'precision', label: 'Precision' },
  { key: 'recall', label: 'Recall' },
] as const;

const CLASS_COLORS: Record<string, string> = {
  Normal: '#00e5a0',
  DDoS_TCP: '#55c6eb',
  DDoS_UDP: '#7c3aed',
  DDoS_ICMP: '#f97316',
  DDoS_HTTP: '#fbbf24',
  Port_Scanning: '#ef4444',
  Vulnerability_scanner: '#22c55e',
  Backdoor: '#a855f7',
  MITM: '#06b6d4',
  Password: '#ec4899',
  SQL_injection: '#f97316',
  XSS: '#eab308',
  Uploading: '#8b5cf6',
  Ransomware: '#dc2626',
  Fingerprinting: '#6b7280',
};

export function Classes() {
  const { data: experiments } = useExperiments();
  const [selectedExperiment, setSelectedExperiment] = useState(experiments?.[1]?.experiment_name || 'phase2-fedavg-iid-multiclass');
  const [selectedMetric, setSelectedMetric] = useState<'f1' | 'precision' | 'recall' | 'support'>('f1');
  const [search, setSearch] = useState('');

  const { data: classData, loading, error } = useClassMetrics(selectedExperiment);

  const filteredData = useMemo(() => {
    if (!search.trim()) return classData || [];
    return (classData || []).filter(d =>
      d.class_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [classData, search]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (selectedMetric === 'support') return b.support - a.support;
      return a[selectedMetric] - b[selectedMetric];
    });
  }, [filteredData, selectedMetric]);

  const macroAvg = useMemo(() => {
    if (!classData?.length) return null;
    const sum = classData.reduce((acc, d) => acc + d[selectedMetric], 0);
    return sum / classData.length;
  }, [classData, selectedMetric]);

  if (loading) return <div className="section" style={{height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-muted)'}}>Loading class metrics…</div>;
  if (error) return <div className="section glass-card" style={{textAlign: 'center', padding: 'var(--space-12)'}}><h3 style={{color: 'var(--danger)'}}>Failed to load</h3><p style={{marginTop: 'var(--space-2)', color: 'var(--fg-muted)'}}>{error.message}</p></div>;

  const expNames: Record<string, string> = {
    'central_mlp_v3_128x64_multiclass': 'Centralized MLP',
    'phase2-fedavg-iid-multiclass': 'FedAvg (IID)',
    'phase2-fedavg-noniid-multiclass': 'FedAvg (Non-IID)',
    'phase2-fedprox-iid-multiclass': 'FedProx (IID)',
  };

  return (
    <div className="section">
      {/* Header */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)'}}>
        <div>
          <h1 style={{fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-3xl)'}}>Per-Class Metrics</h1>
          <p style={{color: 'var(--fg-muted)', marginTop: 'var(--space-1)'}}>Detailed breakdown across all 15 attack classes</p>
        </div>
        <div style={{display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap'}}>
          <select
            value={selectedExperiment}
            onChange={e => setSelectedExperiment(e.target.value)}
            className="form-input"
            style={{width: 'auto', minWidth: 220, paddingRight: 'var(--space-10)'}}
          >
            {experiments?.map(exp => (
              <option key={exp.experiment_name} value={exp.experiment_name}>
                {expNames[exp.experiment_name] || exp.experiment_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Selector + Search */}
      <div className="glass-card" style={{marginBottom: 'var(--space-6)'}}>
        <div className="card-content" style={{display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-2)'}}>
            <span style={{fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
              Visualize:
            </span>
            {METRIC_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className={`btn ${selectedMetric === opt.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setSelectedMetric(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{flex: 1, minWidth: 200, maxWidth: 360, marginLeft: 'auto'}}>
            <div style={{position: 'relative'}}>
              <IconSearch size={16} strokeWidth={2} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)', pointerEvents: 'none'}} aria-hidden="true" />
              <input
                type="text"
                placeholder="Filter classes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input"
                style={{paddingLeft: '40px'}}
              />
            </div>
          </div>

          {macroAvg !== null && (
            <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)'}}>
              <span style={{fontSize: 'var(--text-xs)', color: 'var(--fg-muted)'}}>Macro Avg:</span>
              <span style={{fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--accent)'}}>
                {(macroAvg * 100).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-card" style={{marginBottom: 'var(--space-6)'}}>
        <div className="card-header">
          <div>
            <div className="card-title">{METRIC_OPTIONS.find(o => o.key === selectedMetric)?.label} by Class</div>
            <div className="card-subtitle">Horizontal bars — longer = better (except Support)</div>
          </div>
        </div>
        <div className="card-content">
          <ClassMetricsBarChart data={sortedData} metric={selectedMetric} />
        </div>
      </div>

      {/* Detailed Table */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title">Complete Class Metrics</div>
          <div className="card-subtitle">All precision, recall, F1, and support values</div>
        </div>
        <div className="card-content" style={{padding: 0}}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{width: '40px'}}>#</th>
                  <th>Class</th>
                  <th style={{textAlign: 'right', width: '100px'}}>Precision</th>
                  <th style={{textAlign: 'right', width: '100px'}}>Recall</th>
                  <th style={{textAlign: 'right', width: '100px'}}>F1 Score</th>
                  <th style={{textAlign: 'right', width: '100px'}}>Support</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, idx) => {
                  const color = CLASS_COLORS[row.class_name] || '#7a8aa3';
                  const getMetricClass = (val: number) => {
                    if (selectedMetric === 'support' as any) return '';
                    if (val >= 0.8) return 'high';
                    if (val >= 0.5) return 'med';
                    return 'low';
                  };
                  return (
                    <tr key={row.class_name}>
                      <td style={{color: 'var(--fg-subtle)', fontFamily: 'var(--font-display)', fontWeight: 600}}>{idx + 1}</td>
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-2)'}}>
                          <span style={{width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0}}></span>
                          <span style={{fontWeight: 500}}>{row.class_name}</span>
                        </div>
                      </td>
                      <td style={{textAlign: 'right'}}><span className={`metric-cell ${getMetricClass(row.precision)}`}>{(row.precision * 100).toFixed(1)}%</span></td>
                      <td style={{textAlign: 'right'}}><span className={`metric-cell ${getMetricClass(row.recall)}`}>{(row.recall * 100).toFixed(1)}%</span></td>
                      <td style={{textAlign: 'right'}}><span className={`metric-cell ${getMetricClass(row.f1)}`}>{(row.f1 * 100).toFixed(1)}%</span></td>
                      <td style={{textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--fg-muted)'}}>{row.support.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Class Details Expandable */}
      <div className="glass-card" style={{marginTop: 'var(--space-6)'}}>
        <div className="card-header">
          <div className="card-title">Class Definitions & Notes</div>
        </div>
        <div className="card-content">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)'}}>
            {[
              { name: 'Normal', desc: 'Benign IoT traffic', icon: IconActivity },
              { name: 'DDoS_TCP', desc: 'TCP flood attack', icon: IconZap },
              { name: 'DDoS_UDP', desc: 'UDP flood attack', icon: IconZap },
              { name: 'DDoS_ICMP', desc: 'ICMP flood attack', icon: IconZap },
              { name: 'DDoS_HTTP', desc: 'HTTP flood attack', icon: IconZap },
              { name: 'Port_Scanning', desc: 'Network reconnaissance', icon: IconTarget },
              { name: 'Vulnerability_scanner', desc: 'Automated vuln scanning', icon: IconTarget },
              { name: 'Backdoor', desc: 'Persistent access', icon: IconArrowDownRight },
              { name: 'MITM', desc: 'Man-in-the-middle', icon: IconArrowUpRight },
              { name: 'Password', desc: 'Brute force / credential stuffing', icon: IconArrowDownRight },
              { name: 'SQL_injection', desc: 'SQL injection attacks', icon: IconArrowUpRight },
              { name: 'XSS', desc: 'Cross-site scripting', icon: IconArrowUpRight },
              { name: 'Uploading', desc: 'Malicious file upload', icon: IconArrowDownRight },
              { name: 'Ransomware', desc: 'Encryption/ransomware', icon: IconArrowDownRight },
              { name: 'Fingerprinting', desc: 'OS/service fingerprinting', icon: IconTarget },
            ].map(item => (
              <div key={item.name} style={{display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'}}>
                <item.icon size={16} strokeWidth={2} style={{color: CLASS_COLORS[item.name] || 'var(--fg-muted)'}} aria-hidden="true" />
                <div>
                  <div style={{fontWeight: 500, fontSize: 'var(--text-sm)'}}>{item.name}</div>
                  <div style={{fontSize: 'var(--text-xs)', color: 'var(--fg-muted)'}}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}