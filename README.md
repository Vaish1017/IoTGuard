# Northstar | IoT Security Monitor

A React and FastAPI dashboard for inspecting the referenced Edge-IIoTset federated-learning experiments and for demonstrating an inference-monitoring workflow.

## Run locally

```bash
python -m pip install -r requirements.txt
cd frontend && npm ci && npm run build
cd .. && uvicorn backend.main:app --host 0.0.0.0 --port 3000 --reload
```

The FastAPI API and compiled frontend share port 3000. API docs are available at `/docs`; health is at `/api/health`. Dashboard data endpoints include `/api/overview`, `/api/experiments`, `/api/classes`, and `/api/simulation`; submit demo telemetry to `POST /api/inference` and read the generated feed from `/api/stream`.

## Source data and scope

Historical model metrics and per-class results are loaded from the Phase 2 machine-readable comparison and CSV artifacts. The underlying project reports a single-machine Flower/PyTorch simulation over one Edge-IIoTset-derived split. Its results do not demonstrate secure aggregation, differential privacy, organization-level isolation, measured network traffic, or generalization to unseen environments.

The real-time panel is explicitly a **synthetic telemetry demonstration**. Its anomaly labels use transparent thresholds over demonstration fields; it does not load or claim to reproduce the saved 128×64 MLP. The referenced deliverable archive does not contain the model checkpoint, fitted preprocessor, or raw data required for actual inference. A production inference adapter should be wired to verified, hash-matched artifacts before treating predictions as IDS outputs.
