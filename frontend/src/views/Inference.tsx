// ==========================================================================
// IoTGuard — Inference Demo View
// ==========================================================================

import { useState, useRef } from 'react';
import { useInference } from '../api';
import { IconZap, IconRefreshCw, IconCheckCircle, IconAlertTriangle, IconInfo, IconActivity } from '../components/Icons';
import type { FlowInput, InferenceResponse } from '../types';

const DEFAULT_FLOW: FlowInput = {
  device_id: 'edge-gateway-07',
  protocol: 'TCP',
  packets_per_second: 84,
  failed_connections: 0,
  unique_destination_ports: 1,
  payload_entropy: 4.2,
  icmp_share: 0.05,
};

const PRESET_FLOWS: Array<{ label: string; flow: FlowInput; desc: string }> = [
  {
    label: 'Normal Traffic',
    desc: 'Baseline IoT device communication',
    flow: { device_id: 'edge-gateway-07', protocol: 'TCP', packets_per_second: 61, failed_connections: 1, unique_destination_ports: 1, payload_entropy: 3.8, icmp_share: 0.05 },
  },
  {
    label: 'Port Scan',
    desc: 'High destination port fan-out',
    flow: { device_id: 'line-controller-05', protocol: 'HTTP', packets_per_second: 115, failed_connections: 3, unique_destination_ports: 34, payload_entropy: 5.1, icmp_share: 0.05 },
  },
  {
    label: 'ICMP Flood (DDoS)',
    desc: 'High-rate ICMP with large share',
    flow: { device_id: 'clinic-router-03', protocol: 'ICMP', packets_per_second: 720, failed_connections: 0, unique_destination_ports: 2, payload_entropy: 2.7, icmp_share: 0.92 },
  },
  {
    label: 'Password Attack',
    desc: 'Repeated failed connections',
    flow: { device_id: 'building-hub-22', protocol: 'TCP', packets_per_second: 44, failed_connections: 31, unique_destination_ports: 2, payload_entropy: 4.4, icmp_share: 0.05 },
  },
  {
    label: 'TCP Flood (DDoS)',
    desc: 'Extreme packet rate',
    flow: { device_id: 'clinic-router-09', protocol: 'TCP', packets_per_second: 520, failed_connections: 5, unique_destination_ports: 4, payload_entropy: 4.9, icmp_share: 0.05 },
  },
  {
    label: 'XSS Attempt',
    desc: 'High payload entropy',
    flow: { device_id: 'sensor-node-11', protocol: 'HTTP', packets_per_second: 89, failed_connections: 2, unique_destination_ports: 3, payload_entropy: 7.5, icmp_share: 0.05 },
  },
];

const FIELD_CONFIG: Array<{ key: keyof FlowInput; label: string; type: 'text' | 'number' | 'select'; min?: number; max?: number; step?: number; options?: Array<{ value: string; label: string }>; help: string }> = [
  { key: 'device_id', label: 'Device ID', type: 'text', help: 'Identifier for the IoT device or gateway' },
  { key: 'protocol', label: 'Protocol', type: 'select', options: ['TCP', 'UDP', 'ICMP', 'HTTP', 'MQTT'].map(v => ({ value: v, label: v })), help: 'Network protocol' },
  { key: 'packets_per_second', label: 'Packets/sec', type: 'number', min: 0, max: 100000, step: 1, help: 'Observed packet rate' },
  { key: 'failed_connections', label: 'Failed Connections', type: 'number', min: 0, max: 100000, step: 1, help: 'Count of failed connection attempts' },
  { key: 'unique_destination_ports', label: 'Unique Dest. Ports', type: 'number', min: 0, max: 65535, step: 1, help: 'Number of distinct destination ports contacted' },
  { key: 'payload_entropy', label: 'Payload Entropy', type: 'number', min: 0, max: 8, step: 0.1, help: 'Shannon entropy of packet payloads (0-8)' },
  { key: 'icmp_share', label: 'ICMP Share', type: 'number', min: 0, max: 1, step: 0.01, help: 'Fraction of traffic that is ICMP (0-1)' },
];

const SEVERITY_STYLES = {
  High: { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)', text: '#f97316', icon: '#f97316', label: 'HIGH THREAT' },
  Medium: { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)', text: '#fbbf24', icon: '#fbbf24', label: 'SUSPICIOUS' },
  Low: { bg: 'rgba(0, 229, 160, 0.15)', border: 'rgba(0, 229, 160, 0.3)', text: '#00e5a0', icon: '#00e5a0', label: 'NORMAL' },
};

export function Inference() {
  const [formData, setFormData] = useState<FlowInput>(DEFAULT_FLOW);
  const [result, setResult] = useState<InferenceResponse | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { mutate, loading, error } = useInference();
  const resultRef = useRef<HTMLDivElement>(null);

  const handleChange = (key: keyof FlowInput, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await mutate(formData);
    if (res) {
      setResult(res);
      setSubmitted(true);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  };

  const loadPreset = (flow: FlowInput) => {
    setFormData(flow);
    setSubmitted(false);
  };

  const resetForm = () => {
    setFormData(DEFAULT_FLOW);
    setResult(null);
    setSubmitted(false);
  };

  return (
    <div className="section">
      {/* Header */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)'}}>
        <div>
          <h1 style={{fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-3xl)'}}>Inference Demo</h1>
          <p style={{color: 'var(--fg-muted)', marginTop: 'var(--space-1)'}}>Submit telemetry and inspect rule-based anomaly detection</p>
        </div>
        <button className="btn btn-secondary" onClick={resetForm} disabled={loading && !submitted}>
          <IconRefreshCw size={16} strokeWidth={2} /> Reset
        </button>
      </div>

      {/* Disclosure */}
      <div className="disclosure" style={{marginBottom: 'var(--space-6)'}}>
        <IconInfo size={18} strokeWidth={2} aria-hidden="true" />
        <div>
          <strong>Demo Mode:</strong> This uses transparent threshold rules over submitted telemetry fields —
          <strong>not</strong> the trained 128×64 MLP from Edge-IIoTset. The checkpoint and preprocessor are not bundled.
          Predictions are heuristic anomaly scores, not calibrated probabilities. See
          <a href="/api/experiment-report" target="_blank" rel="noopener" style={{color: 'var(--accent)', textDecoration: 'underline'}}>full methodology</a>.
        </div>
      </div>

      {/* Main Layout: Form + Result */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 420px', gap: 'var(--space-6)'}}>
        {/* Input Form */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <div className="card-title">Telemetry Input</div>
              <div className="card-subtitle">Adjust fields or pick a preset scenario</div>
            </div>
          </div>
          <div className="card-content" style={{paddingBottom: 'var(--space-4)'}}>
            <form onSubmit={handleSubmit}>
              {/* Preset Buttons */}
              <div style={{marginBottom: 'var(--space-6)'}}>
                <div style={{fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)'}}>
                  Quick Scenarios
                </div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)'}}>
                  {PRESET_FLOWS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => loadPreset(preset.flow)}
                      style={{flex: 1, minWidth: 140, textAlign: 'left', justifyContent: 'flex-start'}}
                      title={preset.desc}
                    >
                      <span style={{fontWeight: 500}}>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{borderTop: '1px solid var(--border)', paddingTop: 'var(--space-6)', marginBottom: 'var(--space-4)'}}>
                <div style={{fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)'}}>
                  Manual Input
                </div>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)'}}>
                  {FIELD_CONFIG.map(field => (
                    <div key={field.key} className="form-group" style={field.key === 'device_id' ? {gridColumn: '1 / -1'} : {}}>
                      <label className="form-label" htmlFor={field.key}>{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          id={field.key}
                          value={formData[field.key]}
                          onChange={e => handleChange(field.key, e.target.value)}
                          className="form-input"
                          disabled={loading}
                        >
                          {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : field.type === 'number' ? (
                        <input
                          id={field.key}
                          type="number"
                          value={formData[field.key]}
                          onChange={e => handleChange(field.key, Number(e.target.value))}
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          className="form-input"
                          disabled={loading}
                          placeholder={field.min !== undefined ? `${field.min}–${field.max}` : undefined}
                        />
                      ) : (
                        <input
                          id={field.key}
                          type="text"
                          value={formData[field.key]}
                          onChange={e => handleChange(field.key, e.target.value)}
                          className="form-input"
                          disabled={loading}
                        />
                      )}
                      <div style={{fontSize: 'var(--text-xs)', color: 'var(--fg-subtle)', marginTop: 'var(--space-1)'}}>{field.help}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)'}}>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{flex: 1}}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <IconRefreshCw size={18} strokeWidth={2} style={{animation: 'spin 1s linear infinite'}} />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <IconZap size={18} strokeWidth={2} />
                      Run Inference
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Result Panel */}
        <div ref={resultRef} style={{display: 'flex', flexDirection: 'column'}}>
          {submitted && result ? (
            <ResultCard result={result} />
          ) : (
            <div className="glass-card" style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'var(--space-12)'}}>
              <IconActivity size={48} strokeWidth={1.5} style={{color: 'var(--fg-subtle)', opacity: 0.5, marginBottom: 'var(--space-4)'}} aria-hidden="true" />
              <h3 style={{fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)'}}>No Prediction Yet</h3>
              <p style={{color: 'var(--fg-muted)', maxWidth: 280}}>
                Configure telemetry fields or select a preset scenario, then click <strong>Run Inference</strong> to see the rule-based classification.
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && !submitted && (
            <div className="glass-card" style={{borderColor: 'var(--danger)', background: 'rgba(249,115,22,0.05)'}}>
              <div className="card-content" style={{display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)'}}>
                <IconAlertTriangle size={20} strokeWidth={2} style={{color: 'var(--danger)', flexShrink: 0, marginTop: '2px'}} aria-hidden="true" />
                <div>
                  <div style={{fontWeight: 600, color: 'var(--danger)', marginBottom: 'var(--space-1)'}}>Inference Failed</div>
                  <div style={{fontSize: 'var(--text-sm)', color: 'var(--fg-muted)'}}>{error.message}</div>
                  <button className="btn btn-sm btn-danger" style={{marginTop: 'var(--space-3)'}} onClick={() => mutate(formData)}>
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rule Explanation */}
      <div className="glass-card" style={{marginTop: 'var(--space-6)'}}>
        <div className="card-header">
          <div className="card-title">Detection Rules (Transparent Heuristics)</div>
          <div className="card-subtitle">These exact thresholds are applied in order — first match wins</div>
        </div>
        <div className="card-content">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)'}}>
            {[
              { condition: 'unique_destination_ports ≥ 18', class: 'Port_Scanning', score: '68–97', desc: 'Destination-port fan-out exceeded threshold' },
              { condition: 'protocol = ICMP ∧ icmp_share ≥ 0.65 ∧ packets/sec ≥ 160', class: 'DDoS_ICMP', score: '68–96', desc: 'High-rate ICMP traffic crossed threshold' },
              { condition: 'failed_connections ≥ 14 ∧ packets/sec ≥ 25', class: 'Password', score: '67–95', desc: 'Repeated failed connections crossed threshold' },
              { condition: 'payload_entropy ≥ 7.2', class: 'XSS', score: '68–94', desc: 'High payload entropy crossed threshold' },
              { condition: 'packets/sec ≥ 450', class: 'DDoS_TCP', score: '68–96', desc: 'Packet rate crossed threshold' },
              { condition: 'none of the above', class: 'Normal', score: '6–42', desc: 'No demo rule threshold was crossed' },
            ].map((rule, i) => (
              <div key={rule.class} style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', padding: 'var(--space-4)', background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${i < 5 ? 'var(--danger)' : 'var(--accent)'}`}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap'}}>
                  <code style={{fontSize: 'var(--text-xs)', background: 'rgba(100,120,150,0.15)', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace'}}>{rule.condition}</code>
                  <span className={`badge ${i < 5 ? 'badge-danger' : 'badge-success'}`}>{rule.class}</span>
                  <span className="badge badge-neutral" style={{marginLeft: 'auto'}}>Score: {rule.score}</span>
                </div>
                <div style={{fontSize: 'var(--text-xs)', color: 'var(--fg-muted)'}}>{rule.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: InferenceResponse }) {
  const severity = result.severity;
  const style = SEVERITY_STYLES[severity];
  const isAlert = result.alert;

  return (
    <div className="glass-card glass-card-elevated" style={{flex: 1, display: 'flex', flexDirection: 'column', borderColor: style.border, animation: 'feed-in var(--transition-spring)'}}>
      <div className="card-header" style={{borderBottomColor: style.border, flexShrink: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-3)'}}>
          <div style={{
            width: 48, height: 48, borderRadius: 'var(--radius-md)',
            background: style.bg, border: `1px solid ${style.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${style.icon}40`,
          }}>
            {isAlert ? (
              <IconAlertTriangle size={24} strokeWidth={2.5} style={{color: style.icon}} aria-hidden="true" />
            ) : (
              <IconCheckCircle size={24} strokeWidth={2.5} style={{color: style.icon}} aria-hidden="true" />
            )}
          </div>
          <div>
            <div style={{fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-2xl)', color: style.text}}>
              {result.predicted_class}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)'}}>
              <span className={`badge ${isAlert ? 'badge-danger' : 'badge-success'}`}>{style.label}</span>
              <span className="badge badge-info">{result.inference_mode}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-content" style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', paddingTop: 'var(--space-4)'}}>
        {/* Anomaly Score */}
        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)', background: style.bg, border: `1px solid ${style.border}`, borderRadius: 'var(--radius-md)'}}>
          <div style={{fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-4xl)', color: style.text, lineHeight: 1}}>
            {result.anomaly_score}
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)'}}>
              Anomaly Score (0–100)
            </div>
            <div style={{height: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 9999, overflow: 'hidden'}}>
              <div style={{
                width: `${result.anomaly_score}%`, height: '100%',
                background: `linear-gradient(90deg, ${style.text}, ${style.icon})`,
                borderRadius: 9999,
                transition: 'width 500ms ease',
              }}></div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--fg-subtle)'}}>
              <span>Normal (0)</span>
              <span>Threshold (68)</span>
              <span>Max (100)</span>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div style={{padding: 'var(--space-4)', background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)'}}>
          <div style={{fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)'}}>
            Detection Reason
          </div>
          <div style={{fontSize: 'var(--text-base)', color: 'var(--fg)', lineHeight: 1.5}}>
            {result.reason}
          </div>
        </div>

        {/* Submitted Telemetry Echo */}
        <div style={{padding: 'var(--space-4)', background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)'}}>
          <div style={{fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)'}}>
            Submitted Telemetry
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)'}}>
            {[
              { label: 'Device', value: result.device_id },
              { label: 'Protocol', value: result.protocol },
              { label: 'Packets/sec', value: result.packets_per_second.toLocaleString() },
              { label: 'Failed Conn.', value: result.failed_connections.toString() },
              { label: 'Unique Ports', value: result.unique_destination_ports.toString() },
              { label: 'Origin', value: result.origin },
            ].map(item => (
              <div key={item.label} style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-1)'}}>
                <span style={{fontSize: 'var(--text-xs)', color: 'var(--fg-muted)'}}>{item.label}</span>
                <span style={{fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-base)'}}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{padding: 'var(--space-3)', background: 'var(--warning-dim)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--fg)', display: 'flex', gap: 'var(--space-2)'}}>
          <IconInfo size={14} strokeWidth={2} style={{color: 'var(--warning)', flexShrink: 0, marginTop: '1px'}} aria-hidden="true" />
          <div>
            {result.prediction_basis} {result.score_semantics}
          </div>
        </div>
      </div>
    </div>
  );
}