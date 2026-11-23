// ==========================================================================
// IoTGuard — Live Monitor View
// ==========================================================================

import { useState, useEffect, useMemo } from 'react';
import { useStream } from '../api';
import { AnomalySparkline, ProtocolDonutChart } from '../components/Charts';
import { IconActivity, IconAlertTriangle, IconCheckCircle, IconWifi, IconServer, IconDatabase, IconZap, IconRefreshCw, IconFilter, IconPause, IconPlay, IconTarget } from '../components/Icons';

const SEVERITY_COLORS = {
  High: { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)', text: '#f97316', icon: '#f97316' },
  Medium: { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)', text: '#fbbf24', icon: '#fbbf24' },
  Low: { bg: 'rgba(0, 229, 160, 0.15)', border: 'rgba(0, 229, 160, 0.3)', text: '#00e5a0', icon: '#00e5a0' },
};

const PROTOCOL_COLORS: Record<string, string> = {
  TCP: '#55c6eb',
  UDP: '#7c3aed',
  ICMP: '#f97316',
  HTTP: '#fbbf24',
  MQTT: '#22c55e',
};

export function Monitor() {
  const { events, meta, loading, error, refetch } = useStream(3600);
  const [paused, setPaused] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
  const [filterProtocol, setFilterProtocol] = useState<string>('all');

  // Auto-pause when tab hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setPaused(true);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (filterSeverity !== 'all' && e.severity !== filterSeverity) return false;
      if (filterProtocol !== 'all' && e.protocol !== filterProtocol) return false;
      return true;
    });
  }, [events, filterSeverity, filterProtocol]);

  const protocols = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => { counts[e.protocol] = (counts[e.protocol] || 0) + 1; });
    return Object.entries(counts).map(([protocol, count]) => ({
      protocol,
      count,
      color: PROTOCOL_COLORS[protocol] || '#7a8aa3',
    }));
  }, [events]);

  const severityCounts = useMemo(() => {
    return {
      High: events.filter(e => e.severity === 'High').length,
      Medium: events.filter(e => e.severity === 'Medium').length,
      Low: events.filter(e => e.severity === 'Low').length,
    };
  }, [events]);

  if (loading && !events.length) return <div className="section" style={{height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-muted)'}}>Connecting to stream…</div>;
  if (error) return <div className="section glass-card" style={{textAlign: 'center', padding: 'var(--space-12)'}}><h3 style={{color: 'var(--danger)'}}>Stream Error</h3><p style={{marginTop: 'var(--space-2)', color: 'var(--fg-muted)'}}>{error.message}</p><button className="btn btn-primary" onClick={refetch} style={{marginTop: 'var(--space-4)'}}>Retry</button></div>;

  return (
    <div className="section">
      {/* Header */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)'}}>
        <div>
          <h1 style={{fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-3xl)'}}>Live Monitor</h1>
          <p style={{color: 'var(--fg-muted)', marginTop: 'var(--space-1)'}}>Synthetic telemetry stream — rule-based anomaly detection demo</p>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-3)'}}>
          <div className="header-status" style={{padding: 'var(--space-2) var(--space-4)'}}>
            <span className={`status-dot ${!paused ? 'live' : ''}`} aria-hidden="true"></span>
            <span>{paused ? 'Paused' : 'Live'}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setPaused(!paused)} aria-pressed={paused}>
            {paused ? <IconPlay size={16} strokeWidth={2} /> : <IconPause size={16} strokeWidth={2} />}
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={refetch} disabled={loading} aria-label="Refresh">
            <IconRefreshCw size={16} strokeWidth={2} style={{animation: loading ? 'spin 1s linear infinite' : 'none'}} />
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="kpi-grid" style={{marginBottom: 'var(--space-6)'}}>
        <div className="glass-card kpi-card">
          <IconActivity size={22} strokeWidth={2} aria-hidden="true" />
          <div className="kpi-value">{meta.total_events_in_memory || events.length}</div>
          <div className="kpi-label">Total Events</div>
        </div>
        <div className="glass-card kpi-card">
          <IconAlertTriangle size={22} strokeWidth={2} style={{color: 'var(--danger)'}} aria-hidden="true" />
          <div className="kpi-value" style={{color: 'var(--danger)'}}>{severityCounts.High}</div>
          <div className="kpi-label">High Severity</div>
        </div>
        <div className="glass-card kpi-card">
          <IconAlertTriangle size={22} strokeWidth={2} style={{color: 'var(--warning)'}} aria-hidden="true" />
          <div className="kpi-value" style={{color: 'var(--warning)'}}>{severityCounts.Medium}</div>
          <div className="kpi-label">Medium Severity</div>
        </div>
        <div className="glass-card kpi-card">
          <IconCheckCircle size={22} strokeWidth={2} style={{color: 'var(--accent)'}} aria-hidden="true" />
          <div className="kpi-value" style={{color: 'var(--accent)'}}>{severityCounts.Low}</div>
          <div className="kpi-label">Normal / Low</div>
        </div>
        <div className="glass-card kpi-card">
          <IconWifi size={22} strokeWidth={2} aria-hidden="true" />
          <div className="kpi-value">{meta.refresh_interval_seconds || 3.6}s</div>
          <div className="kpi-label">Update Interval</div>
        </div>
        <div className="glass-card kpi-card">
          <IconServer size={22} strokeWidth={2} aria-hidden="true" />
          <div className="kpi-value" style={{fontSize: 'var(--text-lg)'}}>Demo Rules</div>
          <div className="kpi-label">Inference Mode</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{marginBottom: 'var(--space-6)'}}>
        <div className="card-content" style={{display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-2)'}}>
            <IconFilter size={16} strokeWidth={2} style={{color: 'var(--fg-muted)'}} aria-hidden="true" />
            <span style={{fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
              Filters:
            </span>
          </div>

          <div style={{display: 'flex', gap: 'var(--space-2)'}}>
            {(['all', 'High', 'Medium', 'Low'] as const).map(sev => (
              <button
                key={sev}
                className={`btn ${filterSeverity === sev ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setFilterSeverity(sev)}
                style={{borderLeft: sev !== 'all' ? `3px solid ${SEVERITY_COLORS[sev].text}` : 'none'}}
              >
                {sev === 'all' ? 'All' : sev}
              </button>
            ))}
          </div>

          <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-2)'}}>
            <select
              value={filterProtocol}
              onChange={e => setFilterProtocol(e.target.value)}
              className="form-input"
              style={{width: 'auto', minWidth: 160}}
            >
              <option value="all">All Protocols</option>
              {protocols.map(p => (
                <option key={p.protocol} value={p.protocol}>{p.protocol} ({p.count})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Live Feed + Side Panel */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-6)'}}>
        {/* Live Feed */}
        <div className="glass-card" style={{display: 'flex', flexDirection: 'column', minHeight: 0}}>
          <div className="card-header" style={{flexShrink: 0}}>
            <div>
              <div className="card-title">Event Stream</div>
              <div className="card-subtitle">Most recent first — synthetic telemetry every ~3.6s</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-2)'}}>
              <span style={{fontSize: 'var(--text-xs)', color: 'var(--fg-muted)'}}>{filteredEvents.length} events</span>
            </div>
          </div>
          <div className="live-feed" style={{flex: 1, overflowY: 'auto', padding: 'var(--space-4)', paddingTop: 0}}>
            {filteredEvents.length === 0 ? (
              <div className="empty-state" style={{padding: 'var(--space-12)'}}>
                <IconFilter size={48} strokeWidth={1.5} aria-hidden="true" />
                <div className="empty-title">No matching events</div>
                <div className="empty-desc">Adjust filters or wait for new telemetry</div>
              </div>
            ) : (
              filteredEvents.map((event, idx) => {
                const sev = SEVERITY_COLORS[event.severity];
                const protoColor = PROTOCOL_COLORS[event.protocol];
                return (
                  <div
                    key={event.id}
                    className="feed-item"
                    style={{
                      animationDelay: `${Math.min(idx * 30, 300)}ms`,
                      borderLeft: `3px solid ${sev.border}`,
                    }}
                  >
                    <div className="feed-time">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="feed-main">
                      <div className="feed-row">
                        <span className="feed-device">{event.device_id}</span>
                        <span className="feed-protocol" style={{background: `${protoColor}20`, color: protoColor}}>{event.protocol}</span>
                        {event.origin !== 'Synthetic telemetry' && (
                          <span className="badge badge-info" style={{fontSize: '10px'}}>{event.origin}</span>
                        )}
                      </div>
                      <div className="feed-meta">
                        <span><IconZap size={10} strokeWidth={2} aria-hidden="true" /> {event.packets_per_second.toLocaleString()} pps</span>
                        <span><IconDatabase size={10} strokeWidth={2} aria-hidden="true" /> {event.failed_connections} failed</span>
                        <span><IconTarget size={10} strokeWidth={2} aria-hidden="true" /> {event.unique_destination_ports} ports</span>
                      </div>
                    </div>
                    <AnomalySparkline score={event.anomaly_score} />
                    <span className={`badge feed-badge ${event.alert ? 'badge-danger' : 'badge-success'}`}>
                      {event.predicted_class}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Side Panel: Stats + Protocol Donut + Disclosure */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-4)'}}>
          {/* Severity Breakdown */}
          <div className="glass-card">
            <div className="card-header" style={{paddingBottom: 'var(--space-3)'}}>
              <div className="card-title">Severity Breakdown</div>
            </div>
            <div className="card-content" style={{paddingTop: 0}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-3)'}}>
                {(['High', 'Medium', 'Low'] as const).map(sev => {
                  const colors = SEVERITY_COLORS[sev];
                  const count = severityCounts[sev];
                  const pct = events.length ? (count / events.length) * 100 : 0;
                  return (
                    <div key={sev} style={{display: 'flex', alignItems: 'center', gap: 'var(--space-3)'}}>
                      <div style={{width: 10, height: 10, borderRadius: '50%', background: colors.text, boxShadow: `0 0 8px ${colors.text}`}}></div>
                      <div style={{flex: 1, display: 'flex', justifyContent: 'space-between'}}>
                        <span style={{fontWeight: 500}}>{sev}</span>
                        <span style={{color: 'var(--fg-muted)', fontSize: 'var(--text-sm)'}}>{count} ({(pct).toFixed(1)}%)</span>
                      </div>
                      <div style={{width: 80, height: 6, background: 'rgba(100,120,150,0.1)', borderRadius: 9999, overflow: 'hidden'}}>
                        <div style={{width: `${pct}%`, height: '100%', background: colors.text, borderRadius: 9999, transition: 'width 300ms ease'}}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Protocol Distribution */}
          <div className="glass-card">
            <div className="card-header" style={{paddingBottom: 'var(--space-3)'}}>
              <div className="card-title">Protocol Distribution</div>
            </div>
            <div className="card-content" style={{paddingTop: 0, height: 220}}>
              <ProtocolDonutChart data={protocols} />
            </div>
          </div>

          {/* Disclosure */}
          <div className="disclosure">
            <IconAlertTriangle size={18} strokeWidth={2} aria-hidden="true" />
            <div>
              <strong>Demo Disclosure:</strong> This stream uses synthetic telemetry with transparent threshold rules.
              It does not load the trained 128×64 MLP checkpoint. Predictions are heuristic anomaly scores,
              not calibrated model probabilities. See <a href="/api/experiment-report" target="_blank" rel="noopener" style={{color: 'var(--accent)', textDecoration: 'underline'}}>full report</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}