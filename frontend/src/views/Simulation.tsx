// ==========================================================================
// IoTGuard — Federation Simulation View
// ==========================================================================

import { useSimulation, useExperiments } from '../api';
import { ValidationTrajectoryChart, FederatedRoundsChart } from '../components/Charts';
import { IconUsers, IconDatabase, IconZap, IconGitBranch, IconTarget, IconAlertTriangle, IconCpuChip } from '../components/Icons';

export function Simulation() {
  const { data, loading, error } = useSimulation();
  const { data: experiments } = useExperiments();

  if (loading) return <div className="section" style={{height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-muted)'}}>Loading simulation…</div>;
  if (error) return <div className="section glass-card" style={{textAlign: 'center', padding: 'var(--space-12)'}}><h3 style={{color: 'var(--danger)'}}>Failed to load</h3><p style={{marginTop: 'var(--space-2)', color: 'var(--fg-muted)'}}>{error.message}</p></div>;

  const fedExp = experiments?.find(e => e.algorithm === 'fedavg');

  return (
    <div className="section">
      {/* Header */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)'}}>
        <div>
          <h1 style={{fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-3xl)'}}>Federation</h1>
          <p style={{color: 'var(--fg-muted)', marginTop: 'var(--space-1)'}}>Flower simulation configuration, rounds, and client status</p>
        </div>
      </div>

      {/* Simulation Config KPIs */}
      <div className="kpi-grid" style={{marginBottom: 'var(--space-6)'}}>
        <div className="glass-card kpi-card">
          <IconUsers size={22} strokeWidth={2} aria-hidden="true" />
          <div className="kpi-value">{data?.client_count}</div>
          <div className="kpi-label">Clients</div>
        </div>
        <div className="glass-card kpi-card">
          <IconGitBranch size={22} strokeWidth={2} aria-hidden="true" />
          <div className="kpi-value">{data?.rounds}</div>
          <div className="kpi-label">Rounds</div>
        </div>
        <div className="glass-card kpi-card">
          <IconCpuChip size={22} strokeWidth={2} aria-hidden="true" />
          <div className="kpi-value">{data?.local_epochs_per_round}</div>
          <div className="kpi-label">Local Epochs / Round</div>
        </div>
        <div className="glass-card kpi-card">
          <IconDatabase size={22} strokeWidth={2} aria-hidden="true" />
          <div className="kpi-value" style={{fontSize: 'var(--text-xl)'}}>{(data?.batch_size ? data.batch_size / 1024 : 0).toFixed(0)}K</div>
          <div className="kpi-label">Batch Size</div>
        </div>
        <div className="glass-card kpi-card">
          <IconTarget size={22} strokeWidth={2} aria-hidden="true" />
          <div className="kpi-value">{data?.dirichlet_alpha}</div>
          <div className="kpi-label">Dirichlet α</div>
        </div>
        <div className="glass-card kpi-card">
          <IconZap size={22} strokeWidth={2} aria-hidden="true" />
          <div className="kpi-value">{data?.fedprox_mu}</div>
          <div className="kpi-label">FedProx μ</div>
        </div>
      </div>

      {/* Client Status */}
      <div className="glass-card" style={{marginBottom: 'var(--space-6)'}}>
        <div className="card-header">
          <div>
            <div className="card-title">Client Status</div>
            <div className="card-subtitle">Organization-level participants in the federation</div>
          </div>
        </div>
        <div className="card-content">
          <div className="sim-clients">
            {data?.clients?.map((client, idx) => (
              <div key={client} className="client-card" style={{animationDelay: `${idx * 80}ms`}}>
                <div className={`client-indicator ${idx < (data?.client_count || 0) ? 'active' : 'idle'}`} aria-hidden="true"></div>
                <div className="client-info">
                  <div className="client-name">{client}</div>
                  <div className="client-stats">
                    <span>{data?.train_rows_per_run?.toLocaleString()} train rows</span>
                    <span>{data?.validation_rows_per_run?.toLocaleString()} val rows</span>
                    <span>Round {fedExp?.best_validation_round_or_epoch || data?.rounds} best</span>
                  </div>
                </div>
                <div className="client-progress">
                  <div className="client-progress-bar" style={{width: `${Math.min(100, (idx + 1) * 100 / (data?.rounds || 4))}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Validation Trajectory */}
      <div className="glass-card" style={{marginBottom: 'var(--space-6)'}}>
        <div className="card-header">
          <div>
            <div className="card-title">Validation Trajectory</div>
            <div className="card-subtitle">Macro F1 progression across federated rounds</div>
          </div>
        </div>
        <div className="card-content">
          {fedExp?.validation_trajectory?.length ? (
            <ValidationTrajectoryChart data={fedExp.validation_trajectory} color="#7c3aed" />
          ) : (
            <FederatedRoundsChart rounds={data?.rounds || 4} currentRound={fedExp?.best_validation_round_or_epoch || data?.rounds || 4} />
          )}
        </div>
      </div>

      {/* Configuration Details */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)'}}>
        {/* Algorithm Config */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">Algorithm Configuration</div>
          </div>
          <div className="card-content">
            <dl style={{display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--space-2) var(--space-4)'}}>
              <dt style={{color: 'var(--fg-muted)', fontSize: 'var(--text-sm)'}}>Framework</dt>
              <dd style={{fontWeight: 500}}>{data?.algorithm}</dd>

              <dt style={{color: 'var(--fg-muted)', fontSize: 'var(--text-sm)'}}>Strategy</dt>
              <dd style={{fontWeight: 500}}>FedAvg</dd>

              <dt style={{color: 'var(--fg-muted)', fontSize: 'var(--text-sm)'}}>Participation</dt>
              <dd style={{fontWeight: 500}}>{data?.participation}</dd>

              <dt style={{color: 'var(--fg-muted)', fontSize: 'var(--text-sm)'}}>Local Epochs</dt>
              <dd style={{fontWeight: 500}}>{data?.local_epochs_per_round}</dd>

              <dt style={{color: 'var(--fg-muted)', fontSize: 'var(--text-sm)'}}>Batch Size</dt>
              <dd style={{fontWeight: 500}}>{data?.batch_size?.toLocaleString()}</dd>

              <dt style={{color: 'var(--fg-muted)', fontSize: 'var(--text-sm)'}}>Dirichlet α</dt>
              <dd style={{fontWeight: 500}}>{data?.dirichlet_alpha} (IID)</dd>

              <dt style={{color: 'var(--fg-muted)', fontSize: 'var(--text-sm)'}}>FedProx μ</dt>
              <dd style={{fontWeight: 500}}>{data?.fedprox_mu}</dd>

              <dt style={{color: 'var(--fg-muted)', fontSize: 'var(--text-sm)'}}>Observed Failures</dt>
              <dd style={{fontWeight: 500, color: 'var(--success)'}}>{data?.observed_client_failures}</dd>
            </dl>
          </div>
        </div>

        {/* Data Splits */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">Data Splits</div>
          </div>
          <div className="card-content">
            <dl style={{display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--space-2) var(--space-4)'}}>
              <dt style={{color: 'var(--fg-muted)', fontSize: 'var(--text-sm)'}}>Train Rows / Run</dt>
              <dd style={{fontWeight: 500, fontFamily: 'var(--font-display)'}}>{data?.train_rows_per_run?.toLocaleString()}</dd>

              <dt style={{color: 'var(--fg-muted)', fontSize: 'var(--text-sm)'}}>Validation Rows / Run</dt>
              <dd style={{fontWeight: 500, fontFamily: 'var(--font-display)'}}>{data?.validation_rows_per_run?.toLocaleString()}</dd>

              <dt style={{color: 'var(--fg-muted)', fontSize: 'var(--text-sm)'}}>Global Test Rows</dt>
              <dd style={{fontWeight: 500, fontFamily: 'var(--font-display)', color: 'var(--accent)'}}>{data?.global_test_rows?.toLocaleString()}</dd>

              <dt style={{color: 'var(--fg-muted)', fontSize: 'var(--text-sm)'}}>Expected Train Msgs</dt>
              <dd style={{fontWeight: 500}}>{data?.expected_train_messages_per_federated_run}</dd>

              <dt style={{color: 'var(--fg-muted)', fontSize: 'var(--text-sm)'}}>Expected Val Msgs</dt>
              <dd style={{fontWeight: 500}}>{data?.expected_validation_messages_per_federated_run}</dd>
            </dl>
          </div>
        </div>

        {/* Privacy Features */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">Privacy Features</div>
          </div>
          <div className="card-content">
            <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-4)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'}}>
                <div style={{width: 10, height: 10, borderRadius: '50%', background: data?.privacy_features?.differential_privacy ? 'var(--accent)' : 'var(--fg-subtle)', boxShadow: data?.privacy_features?.differential_privacy ? '0 0 10px var(--accent-glow)' : 'none'}}></div>
                <div>
                  <div style={{fontWeight: 500}}>Differential Privacy</div>
                  <div style={{fontSize: 'var(--text-xs)', color: 'var(--fg-muted)'}}>{data?.privacy_features?.differential_privacy ? 'Enabled' : 'Not Implemented'}</div>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'}}>
                <div style={{width: 10, height: 10, borderRadius: '50%', background: data?.privacy_features?.secure_aggregation ? 'var(--accent)' : 'var(--fg-subtle)', boxShadow: data?.privacy_features?.secure_aggregation ? '0 0 10px var(--accent-glow)' : 'none'}}></div>
                <div>
                  <div style={{fontWeight: 500}}>Secure Aggregation</div>
                  <div style={{fontSize: 'var(--text-xs)', color: 'var(--fg-muted)'}}>{data?.privacy_features?.secure_aggregation ? 'Enabled' : 'Not Implemented'}</div>
                </div>
              </div>
            </div>
            <div style={{marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--warning-dim)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--fg)'}}>
              <strong style={{color: 'var(--warning)'}}>Note:</strong> {data?.communication_note}
            </div>
          </div>
        </div>
      </div>

      {/* Limitations */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title">Simulation Limitations</div>
        </div>
        <div className="card-content">
          <ul style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-3)'}}>
            <li style={{display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'}}>
              <IconAlertTriangle size={18} strokeWidth={2} style={{color: 'var(--warning)', flexShrink: 0, marginTop: '2px'}} aria-hidden="true" />
              <span style={{fontSize: 'var(--text-sm)', lineHeight: 1.5}}>Single-machine simulation — not a true distributed deployment</span>
            </li>
            <li style={{display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'}}>
              <IconAlertTriangle size={18} strokeWidth={2} style={{color: 'var(--warning)', flexShrink: 0, marginTop: '2px'}} aria-hidden="true" />
              <span style={{fontSize: 'var(--text-sm)', lineHeight: 1.5}}>No differential privacy or secure aggregation implemented</span>
            </li>
            <li style={{display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'}}>
              <IconAlertTriangle size={18} strokeWidth={2} style={{color: 'var(--warning)', flexShrink: 0, marginTop: '2px'}} aria-hidden="true" />
              <span style={{fontSize: 'var(--text-sm)', lineHeight: 1.5}}>Communication is tensor-size estimate, not measured network traffic</span>
            </li>
            <li style={{display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'}}>
              <IconAlertTriangle size={18} strokeWidth={2} style={{color: 'var(--warning)', flexShrink: 0, marginTop: '2px'}} aria-hidden="true" />
              <span style={{fontSize: 'var(--text-sm)', lineHeight: 1.5}}>Results do not generalize to unseen environments or devices</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}