# IoTGuard Development Roadmap & Milestones

## Completed Milestones

### 1. Model Observability & Performance Benchmarks
- [x] High-fidelity frontend dashboard to visualize multi-class IoT cyberattack detection performance.
- [x] Comparative evaluation between centralized baselines and federated configurations (FedAvg, FedProx under IID and Non-IID Dirichlet partitions).
- [x] Full per-class metric breakdown (Precision, Recall, F1-Score, Support) across 15 Edge-IIoTset traffic categories.
- [x] Explicit transparency regarding benchmark methodology, held-out test splits, and privacy boundaries.

### 2. Federated Simulation Telemetry
- [x] Interactive exploration of simulation parameters (Flower / PyTorch, 4 training rounds, 3 client networks).
- [x] Multi-metric radar comparison and round-by-round validation convergence trajectories.
- [x] Client network status tracking across distributed edge topologies.

### 3. Real-Time Inference Monitoring & Backend API
- [x] Real-time sliding-window telemetry stream (packets/sec, failed connections, port entropy, anomaly scoring).
- [x] FastAPI asynchronous backend exposing authenticated endpoints for overview, experiments, classes, and stream telemetry.
- [x] Interactive operator inference testing with immediate rule-based classification and alert generation.
- [x] Automated test suite verifying data integrity, honest inference disclosures, and input validation bounds.

### 4. Enterprise Visual Interface & Dual Themes
- [x] Cybersecurity dashboard architecture with KPI summary cards, Network Overview AreaCharts, System Health donut gauges, and quick action controls.
- [x] Dual-theme engine supporting Midnight Dark Neon glassmorphism and Crisp Light glassmorphism with persistent state.
- [x] Standardized Manrope typography for interface ergonomics and JetBrains Mono for telemetry, IPs, and timestamps.
- [x] Unified control components (accessible toggles, custom dropdowns, responsive data grids).

---

## Future Roadmap

### Planned Extensions
- [ ] Containerized deployment manifests (Docker, docker-compose, and Kubernetes Helm charts).
- [ ] Production network interface adapter for live PCAP ingestion and Zeek/Suricata log streaming.
- [ ] Experimental implementation of Differential Privacy (DP-SGD) and Secure Aggregation (SecAgg) simulation pipelines.
- [ ] Role-based access control (RBAC) and OAuth2/OIDC operator authentication.
