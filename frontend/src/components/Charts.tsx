// ==========================================================================
// IoTGuard — Chart Components (Recharts wrappers with our design system)
// ==========================================================================

import {
  LineChart, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, RadialBarChart, RadialBar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Area
} from 'recharts';
import type { ClassMetricRow, ValidationTrajectoryPoint, ExperimentRecord } from '../types';

// Color palette matching CSS variables
const COLORS = {
  accent: '#00e5a0',
  cyan: '#55c6eb',
  purple: '#7c3aed',
  danger: '#f97316',
  warning: '#fbbf24',
  success: '#22c55e',
  muted: '#7a8aa3',
  grid: 'rgba(100,120,150,0.08)',
  tooltipBg: 'rgba(14,21,36,0.95)',
  tooltipBorder: 'rgba(100,120,150,0.2)',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: COLORS.tooltipBg,
        border: `1px solid ${COLORS.tooltipBorder}`,
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(24px)',
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: '13px',
        color: '#e8edf5',
        minWidth: 160,
      }}>
        <div style={{ fontWeight: 600, marginBottom: '8px', color: '#7a8aa3', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
        {payload.map((entry: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: i === payload.length - 1 ? 0 : '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color }}></div>
            <span style={{ color: entry.color, fontWeight: 600 }}>{entry.name}</span>
            <span style={{ marginLeft: 'auto', fontFamily: "'Times New Roman', Times, serif", fontWeight: 700 }}>
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const axisStyle = { fontSize: 11, fill: '#7a8aa3', fontFamily: "'Times New Roman', Times, serif" };

// --- Validation Trajectory Line Chart ---
export function ValidationTrajectoryChart({ data, color = COLORS.accent }: { data: ValidationTrajectoryPoint[]; color?: string }) {
  if (!data?.length) return <div className="empty-state" style={{height: 280}}><div className="empty-title">No trajectory data</div></div>;

  const chartData = data.map((d, i) => ({
    step: d.epoch ?? d.round ?? i + 1,
    macroF1: d.validation_macro_f1,
  }));

  const maxF1 = Math.max(...chartData.map(d => d.macroF1));

  return (
    <div className="chart-container" style={{ height: 280, width: '100%' }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trajectoryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} horizontal={true} strokeDasharray="4 4" stroke={COLORS.grid} />
          <XAxis
            dataKey="step"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={v => `R${v}`}
            axisLine={false}
            tickLine={false}
            style={axisStyle}
          />
          <YAxis
            domain={[0, Math.max(1, Math.ceil(maxF1 * 1.2) * 100) / 100]}
            tickFormatter={v => (v * 100).toFixed(0) + '%'}
            axisLine={false}
            tickLine={false}
            style={axisStyle}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="macroF1"
            stroke={color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#trajectoryGradient)"
            dot={false}
            activeDot={{ r: 6, strokeWidth: 2, stroke: '#0a0f1a', fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- Per-Class Horizontal Bar Chart ---
export function ClassMetricsBarChart({ data, metric = 'f1' }: { data: ClassMetricRow[]; metric?: 'precision' | 'recall' | 'f1' | 'support' }) {
  if (!data?.length) return <div className="empty-state" style={{height: 400}}><div className="empty-title">No class metrics</div></div>;

  const sorted = [...data].sort((a, b) => a[metric] - b[metric]);

  return (
    <div className="chart-container" style={{ height: 400, width: '100%' }}>
      <ResponsiveContainer>
        <BarChart data={sorted} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid vertical={true} horizontal={false} strokeDasharray="4 4" stroke={COLORS.grid} />
          <XAxis
            type="number"
            domain={[0, 1]}
            tickFormatter={v => (v * 100).toFixed(0) + '%'}
            axisLine={false}
            tickLine={false}
            style={axisStyle}
            width={40}
          />
          <YAxis
            dataKey="class_name"
            type="category"
            axisLine={false}
            tickLine={false}
            style={{ ...axisStyle, fontSize: 12 }}
            width={140}
            tickMargin={8}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey={metric}
            radius={[0, 4, 4, 0]}
            maxBarSize={32}
          >
            {sorted.map((_, i) => (
              <Cell key={i} fill={`url(#classBarGradient${i})`} />
            ))}
          </Bar>
          <defs>
            {sorted.map((d, i) => (
              <linearGradient key={i} id={`classBarGradient${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={getMetricColor(d[metric])} stopOpacity={0.6} />
                <stop offset="100%" stopColor={getMetricColor(d[metric])} stopOpacity={1} />
              </linearGradient>
            ))}
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function getMetricColor(value: number) {
  if (value >= 0.8) return COLORS.accent;
  if (value >= 0.5) return COLORS.warning;
  return COLORS.danger;
}

// --- Experiment Comparison Radar Chart ---
export function ExperimentRadarChart({ experiments }: { experiments: ExperimentRecord[] }) {
  if (!experiments?.length) return <div className="empty-state" style={{height: 300}}><div className="empty-title">No experiments</div></div>;

  const metrics = [
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'f1_macro', label: 'Macro F1' },
    { key: 'balanced_accuracy', label: 'Bal. Acc.' },
    { key: 'precision_macro', label: 'Precision' },
    { key: 'recall_macro', label: 'Recall' },
    { key: 'roc_auc_macro_ovr', label: 'ROC AUC' },
  ];

  const radarData = experiments.map((exp, i) => {
    const colors = [COLORS.cyan, COLORS.purple, COLORS.accent, COLORS.danger];
    return {
      name: exp.model_type,
      color: colors[i % colors.length],
      ...Object.fromEntries(metrics.map(m => [m.key, (exp.metrics[m.key as keyof typeof exp.metrics] || 0) * 100])),
    };
  });

  return (
    <div className="chart-container" style={{ height: 300, width: '100%' }}>
      <ResponsiveContainer>
        <RadarChart
          data={radarData}
          cx="50%"
          cy="50%"
          outerRadius="75%"
        >
          <PolarGrid
            gridType="polygon"
            polarAngles={Array.from({ length: metrics.length }, (_, i) => (i * 2 * Math.PI) / metrics.length)}
            polarRadius={[20, 40, 60, 80, 100]}
            stroke={COLORS.grid}
            radialLines={true}
          />
          <PolarAngleAxis
            dataKey="name"
            tickFormatter={m => metrics.find(x => x.key === m)?.label || m}
            tick={{ fontSize: 11, fill: '#7a8aa3', fontFamily: "'Times New Roman', Times, serif" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tickFormatter={v => v + '%'}
            tick={{ fontSize: 10, fill: '#7a8aa3', fontFamily: "'Times New Roman', Times, serif" }}
            axisLine={false}
            tickCount={5}
          />
          {radarData.map((_, i) => (
            <Radar
              key={i}
              dataKey={radarData[i].name}
              stroke={radarData[i].color}
              strokeWidth={2}
              fill={radarData[i].color}
              fillOpacity={0.12}
              dot={false}
            />
          ))}
          <Legend
            wrapperStyle={{ paddingTop: 10 }}
            iconType="circle"
            iconSize={8}
            formatter={(name) => <span style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: 12 }}>{name}</span>}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- Federated Rounds Progress ---
export function FederatedRoundsChart({ rounds = 4, currentRound = 4 }: { rounds?: number; currentRound?: number }) {
  const roundData = Array.from({ length: rounds }, (_, i) => ({
    round: i + 1,
    completed: i + 1 <= currentRound,
    active: i + 1 === currentRound,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {roundData.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Times New Roman', Times, serif", fontWeight: 700, fontSize: 14,
            background: r.completed ? 'linear-gradient(135deg, #00e5a0, #55c6eb)' : 'rgba(100,120,150,0.15)',
            color: r.completed ? '#05080d' : '#4a5a73',
            boxShadow: r.active ? '0 0 20px rgba(0,229,160,0.4)' : 'none',
            border: r.active ? '2px solid rgba(0,229,160,0.3)' : 'none',
            transition: 'all 300ms ease',
          }}>
            {r.round}
          </div>
          <div style={{ flex: 1, height: 6, background: 'rgba(100,120,150,0.1)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{
              width: `${(i + 1) / rounds * 100}%`, height: '100%',
              background: r.completed ? 'linear-gradient(90deg, #00e5a0, #55c6eb)' : 'transparent',
              borderRadius: 9999, transition: 'width 500ms ease',
            }}></div>
          </div>
          <span style={{ fontSize: 12, color: '#7a8aa3', minWidth: 80, textAlign: 'right' }}>
            {r.completed ? 'Complete' : r.active ? 'Training...' : 'Pending'}
          </span>
        </div>
      ))}
    </div>
  );
}

// --- Anomaly Score Sparkline (for live feed) ---
export function AnomalySparkline({ score, threshold = 68 }: { score: number; threshold?: number }) {
  const pct = Math.min(100, (score / 100) * 100);
  const color = score >= threshold ? COLORS.danger : score >= threshold * 0.5 ? COLORS.warning : COLORS.accent;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 120 }}>
      <div style={{ flex: 1, height: 6, background: 'rgba(100,120,150,0.1)', borderRadius: 9999, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: color,
          borderRadius: 9999,
          transition: 'width 300ms ease',
        }}></div>
        {/* Threshold marker */}
        <div style={{
          position: 'absolute', top: -2, bottom: -2,
          left: `${Math.min(100, (threshold / 100) * 100)}%`,
          width: 2, background: COLORS.warning, opacity: 0.6,
          transform: 'translateX(-50%)',
        }} />
      </div>
      <span style={{
        fontFamily: "'Times New Roman', Times, serif", fontWeight: 700, fontSize: 14,
        color: color, minWidth: 40, textAlign: 'right',
      }}>{score}</span>
    </div>
  );
}

// --- Protocol Distribution Donut ---
export function ProtocolDonutChart({ data }: { data: Array<{ protocol: string; count: number; color: string }> }) {
  if (!data?.length) return null;

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="chart-container" style={{ height: 200, width: '100%' }}>
      <ResponsiveContainer>
        <RadialBarChart data={data} cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" barSize={16}>
          <RadialBar
            dataKey="count"
            background={false}
            radius={100}
            cornerRadius={4}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </RadialBar>
          <Legend
            layout="vertical"
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: 10 }}
            iconType="circle"
            iconSize={8}
            formatter={(name) => {
              const item = data.find(d => d.protocol === name);
              return (
                <span style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {name} <span style={{ color: '#7a8aa3' }}>{item ? ((item.count / total) * 100).toFixed(1) + '%' : ''}</span>
                </span>
              );
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- Metric Comparison Bar (Centralized vs Federated) ---
export function MetricComparisonBar({ centralized, federated, label, unit = '' }: {
  centralized: number; federated: number; label: string; unit?: string;
}) {
  const max = Math.max(centralized, federated);
  const fmt = (v: number) => unit === '%' ? (v * 100).toFixed(1) + '%' : v.toLocaleString();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span style={{ color: '#7a8aa3' }}>{label}</span>
        <span style={{ fontFamily: "'Times New Roman', Times, serif", fontWeight: 700, color: '#e8edf5' }}>{fmt(Math.max(centralized, federated))}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS.cyan }}></div>
          <span style={{ fontSize: 11, color: COLORS.cyan, minWidth: 100 }}>Centralized</span>
          <div style={{ flex: 1, height: 8, background: 'rgba(100,120,150,0.1)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{ width: `${(centralized / max) * 100}%`, height: '100%', background: COLORS.cyan, borderRadius: 9999 }}></div>
          </div>
          <span style={{ fontFamily: "'Times New Roman', Times, serif", fontWeight: 600, fontSize: 12, minWidth: 50, textAlign: 'right' }}>{fmt(centralized)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS.purple }}></div>
          <span style={{ fontSize: 11, color: '#c4b5fd', minWidth: 100 }}>Federated</span>
          <div style={{ flex: 1, height: 8, background: 'rgba(100,120,150,0.1)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{ width: `${(federated / max) * 100}%`, height: '100%', background: COLORS.purple, borderRadius: 9999 }}></div>
          </div>
          <span style={{ fontFamily: "'Times New Roman', Times, serif", fontWeight: 600, fontSize: 12, minWidth: 50, textAlign: 'right' }}>{fmt(federated)}</span>
        </div>
      </div>
    </div>
  );
}