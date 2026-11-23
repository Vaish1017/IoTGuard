// ==========================================================================
// IoTGuard — TypeScript Types (mirrors backend APIs)
// ==========================================================================

export interface OverviewResponse {
  dataset: string;
  task: string;
  created_utc: string;
  test_rows: number;
  test_used_for_training_or_selection: boolean;
  all_runs_share_same_test_split_and_source: boolean;
  provenance: {
    source_sha256: string;
    preprocessor_sha256: string;
    processed_manifest_sha256: string;
  };
  experiment_count: number;
  default_experiment: string;
  limitations: string[];
}

export interface ExperimentRecord {
  experiment_name: string;
  model_type: string;
  algorithm: string;
  partition_scheme: string;
  task: string;
  metrics: ClassificationMetrics;
  training_seconds: number;
  end_to_end_experiment_seconds: number;
  communication_total_parameter_bytes: number;
  communication_client_to_server_bytes: number;
  communication_server_to_client_bytes: number;
  train_client_failures: number;
  validation_client_failures: number;
  train_client_messages_expected: number;
  validation_client_messages_expected: number;
  validation_trajectory: ValidationTrajectoryPoint[];
  validation_by_round?: ValidationTrajectoryPoint[];
  best_validation_round_or_epoch: number;
  best_validation_macro_f1: number;
  test_rows: number;
  test_used_for_training_or_selection: boolean;
  dirichlet_alpha?: number | null;
  fedprox_mu?: number | null;
}

export interface ClassificationMetrics {
  accuracy: number;
  balanced_accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  precision_weighted: number;
  recall_weighted: number;
  f1_weighted: number;
  roc_auc_macro_ovr: number;
  pr_auc_macro_average_precision_ovr: number;
  cross_entropy_loss: number | null;
}

export interface ValidationTrajectoryPoint {
  epoch?: number;
  round?: number;
  validation_macro_f1: number;
}

export interface ClassMetricRow {
  class_name: string;
  support: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface ClassMetricsResponse {
  experiment_name: string;
  records: ClassMetricRow[];
}

export interface SimulationResponse {
  mode: string;
  algorithm: string;
  clients: string[];
  client_count: number;
  rounds: number;
  local_epochs_per_round: number;
  batch_size: number;
  dirichlet_alpha: number;
  fedprox_mu: number;
  participation: string;
  train_rows_per_run: number;
  validation_rows_per_run: number;
  global_test_rows: number;
  expected_train_messages_per_federated_run: number;
  expected_validation_messages_per_federated_run: number;
  observed_client_failures: number;
  privacy_features: {
    differential_privacy: boolean;
    secure_aggregation: boolean;
  };
  communication_note: string;
}

export interface StreamEvent {
  id: string;
  timestamp: string;
  device_id: string;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'MQTT';
  packets_per_second: number;
  failed_connections: number;
  unique_destination_ports: number;
  predicted_class: string;
  anomaly_score: number;
  alert: boolean;
  severity: 'High' | 'Medium' | 'Low';
  reason: string;
  origin: string;
  inference_mode: string;
  payload_entropy?: number;
  icmp_share?: number;
}

export interface StreamResponse {
  mode: string;
  inference_mode: string;
  trained_model_loaded: boolean;
  events: StreamEvent[];
  total_events_in_memory: number;
  flagged_events_in_memory: number;
  last_event_at: string | null;
  refresh_interval_seconds: number;
}

export interface FlowInput {
  device_id: string;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'MQTT';
  packets_per_second: number;
  failed_connections: number;
  unique_destination_ports: number;
  payload_entropy: number;
  icmp_share: number;
}

export interface InferenceResponse {
  id: string;
  timestamp: string;
  device_id: string;
  protocol: string;
  packets_per_second: number;
  failed_connections: number;
  unique_destination_ports: number;
  predicted_class: string;
  anomaly_score: number;
  alert: boolean;
  severity: 'High' | 'Medium' | 'Low';
  reason: string;
  origin: string;
  inference_mode: string;
  prediction_basis: string;
  score_semantics: string;
  trained_model_loaded: boolean;
}

export interface MetadataResponse {
  feature_policy_version: string;
  raw_model_feature_count: number;
  transformed_feature_count: number;
  model_architecture: string;
  class_count: number;
  training_data: string;
  model_artifact_available: boolean;
  model_artifact_note: string;
}

// UI-specific types
export type ViewMode =
  | 'dashboard'
  | 'sensors'
  | 'alerts'
  | 'devices'
  | 'analytics'
  | 'settings';

export interface NavItem {
  id: ViewMode;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

// Dashboard-specific types for the new UI
export interface SecurityStatus {
  overall: 'secure' | 'warning' | 'critical';
  activeSensors: number;
  totalSensors: number;
  threatsBlocked: number;
  lastScan: string;
}

export interface SensorReading {
  id: string;
  name: string;
  type: 'network' | 'device' | 'application' | 'gateway';
  status: 'online' | 'offline' | 'warning' | 'critical';
  value: number;
  unit: string;
  threshold: number;
  lastUpdate: string;
  location: string;
}

export interface SecurityAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
  deviceId?: string;
}

export interface IoTDevice {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'warning' | 'maintenance';
  ip?: string;
  ipAddress: string;
  firmware: string;
  lastSeen: string;
  location: string;
  sensorCount: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  action: () => void;
  variant: 'primary' | 'secondary' | 'danger';
}