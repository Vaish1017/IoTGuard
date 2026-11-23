// ==========================================================================
// IoTGuard — API Client & Data Fetching Hooks
// ==========================================================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import type {
  OverviewResponse,
  ExperimentRecord,
  ClassMetricsResponse,
  SimulationResponse,
  StreamResponse,
  StreamEvent,
  FlowInput,
  InferenceResponse,
  MetadataResponse,
  ClassMetricRow,
  SecurityStatus,
  SensorReading,
  SecurityAlert,
  IoTDevice,
} from './types';

const API_BASE = '/api';

// --- Simple fetch wrapper ---
async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// --- API Functions ---
export const api = {
  overview: () => fetchJSON<OverviewResponse>('/overview'),
  experiments: () => fetchJSON<{ records: ExperimentRecord[] }>('/experiments'),
  experimentDetail: (name: string) => fetchJSON<ExperimentRecord>(`/experiments/${name}`),
  classMetrics: (experiment: string) => fetchJSON<ClassMetricsResponse>(`/classes?experiment=${encodeURIComponent(experiment)}`),
  simulation: () => fetchJSON<SimulationResponse>('/simulation'),
  stream: (limit = 35) => fetchJSON<StreamResponse>(`/stream?limit=${limit}`),
  inference: (flow: FlowInput) => fetchJSON<InferenceResponse>('/inference', {
    method: 'POST',
    body: JSON.stringify(flow),
  }),
  metadata: () => fetchJSON<MetadataResponse>('/metadata'),
};

// --- Custom Hooks (using native React for zero extra deps) ---

export function useOverview() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.overview()
      .then(d => mounted && setData(d))
      .catch(e => mounted && setError(e))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return { data, error, loading };
}

export function useExperiments() {
  const [data, setData] = useState<ExperimentRecord[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.experiments()
      .then(d => mounted && setData(d.records))
      .catch(e => mounted && setError(e))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return { data, error, loading };
}

export function useClassMetrics(experiment: string) {
  const [data, setData] = useState<ClassMetricRow[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.classMetrics(experiment)
      .then(d => mounted && setData(d.records))
      .catch(e => mounted && setError(e))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [experiment]);

  return { data, error, loading };
}

export function useSimulation() {
  const [data, setData] = useState<SimulationResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.simulation()
      .then(d => mounted && setData(d))
      .catch(e => mounted && setError(e))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return { data, error, loading };
}

export function useStream(pollInterval = 3600) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<Omit<StreamResponse, 'events'>>({} as any);
  const intervalRef = useRef<number>();

  const fetchStream = useCallback(async () => {
    try {
      const res = await api.stream(50);
      setEvents(res.events);
      setMeta({
        mode: res.mode,
        inference_mode: res.inference_mode,
        trained_model_loaded: res.trained_model_loaded,
        total_events_in_memory: res.total_events_in_memory,
        flagged_events_in_memory: res.flagged_events_in_memory,
        last_event_at: res.last_event_at,
        refresh_interval_seconds: res.refresh_interval_seconds,
      });
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStream();
    intervalRef.current = window.setInterval(fetchStream, pollInterval);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchStream, pollInterval]);

  return { events, meta, error, loading, refetch: fetchStream };
}

export function useInference() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (flow: FlowInput): Promise<InferenceResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.inference(flow);
      return res;
    } catch (e) {
      setError(e as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useMetadata() {
  const [data, setData] = useState<MetadataResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.metadata()
      .then(d => mounted && setData(d))
      .catch(e => mounted && setError(e))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return { data, error, loading };
}

// --- Dashboard-specific hooks using real backend data ---

export function useSecurityStatus() {
  const { data: overview } = useOverview();
  const { events, meta } = useStream(3600);
  const { data: simulation } = useSimulation();

  const securityStatus: SecurityStatus = {
    overall: meta.flagged_events_in_memory && meta.flagged_events_in_memory > 0 ? 'warning' : 'secure',
    activeSensors: simulation?.client_count || 3,
    totalSensors: simulation?.client_count || 3,
    threatsBlocked: meta.flagged_events_in_memory || 0,
    lastScan: meta.last_event_at || new Date().toISOString(),
  };

  return { securityStatus, loading: false };
}

export function useSensorReadings() {
  const { events, refetch } = useStream(3600);
  const { data: simulation } = useSimulation();

  // Transform real stream events into 8 comprehensive telemetry sensors
  const sensorReadings: SensorReading[] = [
    {
      id: 'network-traffic',
      name: 'Network Traffic',
      type: 'network',
      status: events.some(e => e.packets_per_second > 400) ? 'warning' : 'online',
      value: events.reduce((sum, e) => sum + e.packets_per_second, 0) / Math.max(events.length, 1),
      unit: 'pps',
      threshold: 500,
      lastUpdate: events[0]?.timestamp || new Date().toISOString(),
      location: 'Edge Gateway',
    },
    {
      id: 'failed-connections',
      name: 'Failed Connections',
      type: 'network',
      status: events.some(e => e.failed_connections > 10) ? 'warning' : 'online',
      value: events.reduce((sum, e) => sum + e.failed_connections, 0) / Math.max(events.length, 1),
      unit: 'count',
      threshold: 15,
      lastUpdate: events[0]?.timestamp || new Date().toISOString(),
      location: 'Edge Gateway',
    },
    {
      id: 'icmp-share',
      name: 'ICMP Share',
      type: 'network',
      status: events.some(e => (e.icmp_share || 0) > 0.65) ? 'warning' : 'online',
      value: Math.min(100, (events.reduce((sum, e) => sum + (e.icmp_share || 0), 0) / Math.max(events.length, 1)) * 100),
      unit: '%',
      threshold: 65,
      lastUpdate: events[0]?.timestamp || new Date().toISOString(),
      location: 'Network Gateway',
    },
    {
      id: 'port-entropy',
      name: 'Port Entropy',
      type: 'application',
      status: events.some(e => e.unique_destination_ports > 15) ? 'warning' : 'online',
      value: events.reduce((sum, e) => sum + e.unique_destination_ports, 0) / Math.max(events.length, 1),
      unit: 'ports',
      threshold: 18,
      lastUpdate: events[0]?.timestamp || new Date().toISOString(),
      location: 'Application Layer',
    },
    {
      id: 'payload-entropy',
      name: 'Payload Entropy',
      type: 'application',
      status: events.some(e => (e.payload_entropy || 0) > 7.0) ? 'warning' : 'online',
      value: events.reduce((sum, e) => sum + (e.payload_entropy || 4.2), 0) / Math.max(events.length, 1),
      unit: 'bits',
      threshold: 7.2,
      lastUpdate: events[0]?.timestamp || new Date().toISOString(),
      location: 'Application Gateway',
    },
    {
      id: 'anomaly-score',
      name: 'Anomaly Score',
      type: 'application',
      status: events.some(e => e.anomaly_score > 70) ? 'warning' : 'online',
      value: events.reduce((sum, e) => sum + e.anomaly_score, 0) / Math.max(events.length, 1),
      unit: 'score',
      threshold: 70,
      lastUpdate: events[0]?.timestamp || new Date().toISOString(),
      location: 'Application Layer',
    },
    {
      id: 'cpu-load',
      name: 'Gateway CPU Load',
      type: 'device',
      status: 'online',
      value: Math.min(95, Math.max(28, Math.round((events.reduce((sum, e) => sum + e.packets_per_second, 0) / Math.max(events.length, 1)) / 7 + 22))),
      unit: '%',
      threshold: 85,
      lastUpdate: events[0]?.timestamp || new Date().toISOString(),
      location: 'Edge Gateway 07',
    },
    {
      id: 'memory-utilization',
      name: 'Memory Utilization',
      type: 'device',
      status: 'online',
      value: Math.min(92, Math.max(35, 52 + (simulation?.client_count || 3) * 3)),
      unit: '%',
      threshold: 90,
      lastUpdate: events[0]?.timestamp || new Date().toISOString(),
      location: 'Edge Gateway 07',
    },
  ];

  return { sensorReadings, refetch, loading: false };
}

// Helper to manage persistent alert acknowledgement and dismissal in localStorage
const ACKNOWLEDGED_KEY = 'iotguard_acknowledged_alerts';
const DISMISSED_KEY = 'iotguard_dismissed_alerts';

function getStoredIdSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveStoredIdSet(key: string, set: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage:`, e);
  }
}

export function useSecurityAlerts() {
  const { events, refetch, loading } = useStream(3600);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(() => getStoredIdSet(ACKNOWLEDGED_KEY));
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => getStoredIdSet(DISMISSED_KEY));

  // Transform stream events into security alerts filtering out dismissed ones
  const alerts: SecurityAlert[] = useMemo(() => {
    return events
      .filter(e => e.alert)
      .slice(0, 35)
      .filter(e => !dismissedIds.has(e.id))
      .map(event => ({
        id: event.id,
        severity: event.severity === 'High' ? 'critical' : event.severity === 'Medium' ? 'high' : 'medium',
        title: `${event.predicted_class} Detected`,
        description: event.reason,
        source: event.device_id,
        timestamp: event.timestamp,
        acknowledged: acknowledgedIds.has(event.id),
        deviceId: event.device_id,
      }));
  }, [events, acknowledgedIds, dismissedIds]);

  const acknowledgeAlert = useCallback((id: string) => {
    setAcknowledgedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveStoredIdSet(ACKNOWLEDGED_KEY, next);
      return next;
    });
  }, []);

  const acknowledgeAll = useCallback(() => {
    setAcknowledgedIds(prev => {
      const next = new Set(prev);
      alerts.forEach(a => next.add(a.id));
      saveStoredIdSet(ACKNOWLEDGED_KEY, next);
      return next;
    });
  }, [alerts]);

  const dismissAlert = useCallback((id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveStoredIdSet(DISMISSED_KEY, next);
      return next;
    });
  }, []);

  const resetAlerts = useCallback(() => {
    setAcknowledgedIds(new Set());
    setDismissedIds(new Set());
    localStorage.removeItem(ACKNOWLEDGED_KEY);
    localStorage.removeItem(DISMISSED_KEY);
    refetch();
  }, [refetch]);

  return {
    alerts,
    acknowledgeAlert,
    acknowledgeAll,
    dismissAlert,
    resetAlerts,
    refetch,
    loading,
  };
}

// Persistent device state in localStorage
const DEVICE_OVERRIDES_KEY = 'iotguard_device_overrides';
const CUSTOM_DEVICES_KEY = 'iotguard_custom_devices';

export function useIoTDevices() {
  const { data: simulation } = useSimulation();
  const { events, refetch, loading } = useStream(3600);

  const [statusOverrides, setStatusOverrides] = useState<Record<string, IoTDevice['status']>>(() => {
    try {
      const saved = localStorage.getItem(DEVICE_OVERRIDES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [customDevices, setCustomDevices] = useState<IoTDevice[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_DEVICES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Create device list from simulation clients and stream events
  const deviceMap = new Map<string, { count: number; lastEvent: StreamEvent }>();
  events.forEach(event => {
    const existing = deviceMap.get(event.device_id);
    if (!existing || new Date(event.timestamp) > new Date(existing.lastEvent.timestamp)) {
      deviceMap.set(event.device_id, { count: (existing?.count || 0) + 1, lastEvent: event });
    }
  });

  const baseDevices = simulation?.clients || ['Smart Hospital Network', 'Industrial IoT Network', 'Smart Building Network'];

  const devices: IoTDevice[] = baseDevices.map((client, index) => {
    const deviceId = `device-${index}`;
    const eventData = deviceMap.get(deviceId);
    const naturalStatus: IoTDevice['status'] = eventData && eventData.lastEvent.alert ? 'warning' : 'online';
    return {
      id: deviceId,
      name: client,
      type: index === 0 ? 'Hospital Gateway' : index === 1 ? 'Industrial Controller' : 'Building Hub',
      status: statusOverrides[deviceId] || naturalStatus,
      ipAddress: `10.0.${index + 1}.1`,
      firmware: '2.4.1',
      lastSeen: eventData?.lastEvent.timestamp || new Date().toISOString(),
      location: client,
      sensorCount: 4,
    };
  });

  // Add individual gateway devices from events with deterministic IP addresses
  const uniqueDevices: IoTDevice[] = Array.from(deviceMap.entries()).map(([deviceId, data], index) => {
    const hash = deviceId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const ipSuffix = (Math.abs(hash) % 240) + 12;
    const ipSubnet = (index % 6) + 1;
    const naturalStatus: IoTDevice['status'] = data.lastEvent.alert ? 'warning' : 'online';

    return {
      id: deviceId,
      name: deviceId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type: 'Edge Gateway',
      status: statusOverrides[deviceId] || naturalStatus,
      ipAddress: `192.168.${ipSubnet}.${ipSuffix}`,
      firmware: '1.8.3',
      lastSeen: data.lastEvent.timestamp,
      location: 'Edge Network',
      sensorCount: 3,
    };
  });

  const updateDeviceStatus = useCallback((id: string, newStatus: IoTDevice['status']) => {
    setStatusOverrides(prev => {
      const next = { ...prev, [id]: newStatus };
      try {
        localStorage.setItem(DEVICE_OVERRIDES_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save device override:', e);
      }
      return next;
    });
  }, []);

  const addDevice = useCallback((deviceInput: Omit<IoTDevice, 'id' | 'lastSeen'>) => {
    const newDevice: IoTDevice = {
      ...deviceInput,
      id: `dev-custom-${Date.now()}`,
      lastSeen: new Date().toISOString(),
    };
    setCustomDevices(prev => {
      const next = [newDevice, ...prev];
      try {
        localStorage.setItem(CUSTOM_DEVICES_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save custom device:', e);
      }
      return next;
    });
    return newDevice;
  }, []);

  const removeDevice = useCallback((id: string) => {
    setCustomDevices(prev => {
      const next = prev.filter(d => d.id !== id);
      try {
        localStorage.setItem(CUSTOM_DEVICES_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save custom devices:', e);
      }
      return next;
    });
  }, []);

  const allDevices = useMemo(() => {
    return [...customDevices, ...devices, ...uniqueDevices];
  }, [customDevices, devices, uniqueDevices]);

  return {
    devices: allDevices,
    updateDeviceStatus,
    addDevice,
    removeDevice,
    refetch,
    loading,
  };
}

export function useNetworkTrafficHistory() {
  const { events, loading, refetch } = useStream(3600);

  // Generate time-series data from events (chronological order)
  const history = useMemo(() => {
    if (!events || events.length === 0) return [];

    const sorted = [...events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const slice = sorted.slice(-30);

    return slice.map((event, idx) => {
      let formattedTime = '';
      try {
        const d = new Date(event.timestamp);
        formattedTime = d.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      } catch {
        formattedTime = `11:${String(10 + idx).padStart(2, '0')}:00`;
      }
      return {
        id: event.id,
        time: formattedTime,
        rawTimestamp: event.timestamp,
        packets: event.packets_per_second,
        failed: event.failed_connections,
        ports: event.unique_destination_ports,
        score: event.anomaly_score,
        protocol: event.protocol,
        deviceId: event.device_id,
        predictedClass: event.predicted_class,
        alert: event.alert,
      };
    });
  }, [events]);

  return { history, loading, refetch };
}

export function useFederatedAnalytics() {
  const { data: experiments } = useExperiments();
  const { data: simulation } = useSimulation();

  const federatedExperiments = experiments?.filter(e => e.algorithm !== 'centralized') || [];
  const centralizedExperiment = experiments?.find(e => e.algorithm === 'centralized');

  const analytics = {
    centralized: centralizedExperiment ? {
      accuracy: centralizedExperiment.metrics.accuracy,
      f1Macro: centralizedExperiment.metrics.f1_macro,
      trainingTime: centralizedExperiment.training_seconds,
    } : null,
    federated: federatedExperiments.map(exp => ({
      name: exp.model_type,
      accuracy: exp.metrics.accuracy,
      f1Macro: exp.metrics.f1_macro,
      trainingTime: exp.training_seconds,
      communication: exp.communication_total_parameter_bytes,
      rounds: 4,
    })),
    simulation: simulation ? {
      clients: simulation.client_count,
      rounds: simulation.rounds,
      trainRows: simulation.train_rows_per_run,
      validationRows: simulation.validation_rows_per_run,
      testRows: simulation.global_test_rows,
    } : null,
  };

  return { analytics, loading: false };
}