// ==========================================================================
// IoTGuard — Experiments Comparison View
// ==========================================================================

import { useState } from 'react';
import { useExperiments } from '../api';
import { ExperimentRadarChart, FederatedRoundsChart } from '../components/Charts';

export function Experiments() {
  const { data: experiments, loading, error } = useExperiments();
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'f1_macro' | 'precision_macro' | 'recall_macro' | 'balanced_accuracy' | 'roc_auc_macro_ovr'>('f1_macro');

  if (loading) return <div className="section" style={{height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-muted)'}}>Loading experiments…</div>;
  if (error) return <div className="section glass-card" style={{textAlign: 'center', padding: 'var(--space-12)'}}><h3 style={{color: 'var(--danger)'}}>Failed to load</h3><p style={{marginTop: 'var(--space-2)', color: 'var(--fg-muted)'}}>{error.message}</p></div>;

  const metricLabels: Record<typeof selectedMetric, string> = {
    accuracy: 'Accuracy',
    f1_macro: 'Macro F1',
    precision_macro: 'Macro Precision',
    recall_macro: 'Macro Recall',
    balanced_accuracy: 'Balanced Accuracy',
    roc_auc_macro_ovr: 'ROC AUC (Macro)',
  };

  const formatValue = (key: string, val: number) => {
    if (['training_seconds', 'end_to_end_experiment_seconds'].includes(key)) return val.toFixed(1) + 's';
    if (key.includes('bytes')) return (val / 1024 / 1024).toFixed(2) + ' MB';
    if (['accuracy', 'f1_macro', 'precision_macro', 'recall_macro', 'balanced_accuracy', 'roc_auc_macro_ovr', 'pr_auc_macro_average_precision_ovr'].includes(key)) return (val * 100).toFixed(2) + '%';
    return val.toLocaleString();
  };

  return (
    <div className="section">
      {/* Header */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)'}}>
        <div>
          <h1 style={{fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-3xl)'}}>Experiments</h1>
          <p style={{color: 'var(--fg-muted)', marginTop: 'var(--space-1)'}}>Side-by-side comparison of centralized and federated training runs</p>
        </div>
        <div style={{display: 'flex', gap: 'var(--space-2)'}}>
          {(['accuracy', 'f1_macro', 'precision_macro', 'recall_macro', 'balanced_accuracy', 'roc_auc_macro_ovr'] as const).map(m => (
            <button
              key={m}
              className={`btn ${selectedMetric === m ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setSelectedMetric(m)}
            >
              {metricLabels[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Radar Chart Overview */}
      <div className="glass-card" style={{marginBottom: 'var(--space-6)'}}>
        <div className="card-header">
          <div>
            <div className="card-title">Multi-Metric Radar Comparison</div>
            <div className="card-subtitle">Normalized metrics across all experiments (higher = better)</div>
          </div>
        </div>
        <div className="card-content">
          <ExperimentRadarChart experiments={experiments} />
        </div>
      </div>

      {/* Detailed Comparison Cards */}
      <div className="exp-compare" style={{marginBottom: 'var(--space-6)'}}>
        {experiments.map((exp, idx) => (
          <div key={exp.experiment_name} className="glass-card exp-card" style={{animationDelay: `${idx * 80}ms`}}>
            <div className="exp-card-header">
              <div>
                <div style={{fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)'}}>
                  {exp.model_type}
                </div>
                <span className={`exp-type ${exp.algorithm === 'centralized' ? 'centralized' : 'federated'}`}>
                  {exp.algorithm === 'centralized' ? 'Centralized Training' : 'Federated (FedAvg)'}
                </span>
              </div>
              <div style={{fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-3xl)', color: 'var(--accent)'}}>
                {(exp.metrics?.[selectedMetric as keyof typeof exp.metrics] ?? 0 * 100).toFixed(1)}%
              </div>
            </div>

            <div className="exp-metrics">
              <div className="exp-metric">
                <div className="exp-metric-value">{(exp.metrics.accuracy * 100).toFixed(2)}%</div>
                <div className="exp-metric-label">Accuracy</div>
              </div>
              <div className="exp-metric">
                <div className="exp-metric-value">{(exp.metrics.f1_macro * 100).toFixed(2)}%</div>
                <div className="exp-metric-label">Macro F1</div>
              </div>
              <div className="exp-metric">
                <div className="exp-metric-value">{(exp.metrics.balanced_accuracy * 100).toFixed(2)}%</div>
                <div className="exp-metric-label">Bal. Accuracy</div>
              </div>
              <div className="exp-metric">
                <div className="exp-metric-value">{(exp.metrics.roc_auc_macro_ovr * 100).toFixed(2)}%</div>
                <div className="exp-metric-label">ROC AUC</div>
              </div>
            </div>

            <div style={{marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)'}}>
              <div>
                <div className="stat-label">Training Time</div>
                <div className="stat-value" style={{fontSize: 'var(--text-lg)'}}>{exp.training_seconds.toFixed(1)}s</div>
              </div>
              <div>
                <div className="stat-label">Total Time</div>
                <div className="stat-value" style={{fontSize: 'var(--text-lg)'}}>{exp.end_to_end_experiment_seconds.toFixed(1)}s</div>
              </div>
              <div>
                <div className="stat-label">Comm. (Client→Server)</div>
                <div className="stat-value" style={{fontSize: 'var(--text-lg)'}}>{(exp.communication_client_to_server_bytes / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <div>
                <div className="stat-label">Comm. (Server→Client)</div>
                <div className="stat-value" style={{fontSize: 'var(--text-lg)'}}>{(exp.communication_server_to_client_bytes / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            </div>

            {exp.algorithm === 'fedavg' && exp.validation_trajectory?.length && (
              <div style={{marginTop: 'var(--space-4)'}}>
                <div className="stat-label" style={{marginBottom: 'var(--space-3)'}}>Validation Trajectory (Macro F1)</div>
                <FederatedRoundsChart rounds={4} currentRound={exp.best_validation_round_or_epoch || 4} />
              </div>
            )}

            <div style={{marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap'}}>
              <span className={`badge ${exp.algorithm === 'centralized' ? 'badge-info' : 'badge-accent'}`}>
                {exp.partition_scheme?.toUpperCase() || 'N/A'}
              </span>
              <span className="badge badge-neutral">Rounds: {4}</span>
              <span className="badge badge-neutral">Local Epochs: {1}</span>
              <span className="badge badge-neutral">Batch: {4096}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Metrics Table */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title">Full Metrics Comparison</div>
          <div className="card-subtitle">All recorded classification metrics across experiments</div>
        </div>
        <div className="card-content">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {experiments.map(exp => (
                    <th key={exp.experiment_name} style={{textAlign: 'right'}}>
                      {exp.model_type}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'accuracy', label: 'Accuracy' },
                  { key: 'balanced_accuracy', label: 'Balanced Accuracy' },
                  { key: 'precision_macro', label: 'Precision (Macro)' },
                  { key: 'recall_macro', label: 'Recall (Macro)' },
                  { key: 'f1_macro', label: 'F1 (Macro)' },
                  { key: 'precision_weighted', label: 'Precision (Weighted)' },
                  { key: 'recall_weighted', label: 'Recall (Weighted)' },
                  { key: 'f1_weighted', label: 'F1 (Weighted)' },
                  { key: 'roc_auc_macro_ovr', label: 'ROC AUC (Macro OVR)' },
                  { key: 'pr_auc_macro_average_precision_ovr', label: 'PR AUC (Macro AP)' },
                ].map(row => (
                  <tr key={row.key}>
                    <td style={{fontWeight: 500}}>{row.label}</td>
                    {experiments.map(exp => (
                      <td key={exp.experiment_name} style={{textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 600}}>
                        {formatValue(row.key, exp.metrics[row.key as keyof typeof exp.metrics] as number)}
                      </td>
                    ))}
                  </tr>
                ))}
                {[
                  { key: 'training_seconds', label: 'Training Time (s)' },
                  { key: 'end_to_end_experiment_seconds', label: 'End-to-End Time (s)' },
                  { key: 'communication_total_parameter_bytes', label: 'Total Comm. (MB)' },
                  { key: 'communication_client_to_server_bytes', label: 'Client→Server (MB)' },
                  { key: 'communication_server_to_client_bytes', label: 'Server→Client (MB)' },
                ].map(row => (
                  <tr key={row.key} style={{borderTop: '1px solid var(--border-strong)'}}>
                    <td style={{fontWeight: 500}}>{row.label}</td>
                    {experiments.map(exp => (
                      <td key={exp.experiment_name} style={{textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--fg-muted)'}}>
                        {formatValue(row.key, (exp as any)[row.key] as number)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}