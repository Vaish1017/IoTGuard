from __future__ import annotations

import asyncio
import csv
import json
import os
from contextlib import asynccontextmanager
from collections import deque
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(__file__).resolve().parent / "data"
FRONTEND_DIST = ROOT / "frontend" / "dist"
with (DATA_DIR / "phase2_federated_comparison.json").open(encoding="utf-8") as source:
    COMPARISON = json.load(source)

EXPERIMENTS = COMPARISON["records"]
EXPERIMENT_BY_ID = {record["experiment_name"]: record for record in EXPERIMENTS}
DEFAULT_EXPERIMENT = "phase2-fedavg-iid-multiclass"
ORGANIZATIONS = [
    "Smart Hospital Network",
    "Industrial IoT Network",
    "Smart Building Network",
]

@asynccontextmanager
async def lifespan(_app: FastAPI):
    global producer_task
    if not EVENTS:
        for _ in range(18):
            append_demo_event()
    producer_task = asyncio.create_task(stream_producer())
    try:
        yield
    finally:
        if producer_task and not producer_task.done():
            producer_task.cancel()
            try:
                await producer_task
            except asyncio.CancelledError:
                pass


app = FastAPI(
    title="Northstar IoT Security API",
    version="1.0.0",
    description=(
        "Source-backed federated experiment metrics plus a clearly labeled, "
        "rule-based inference demonstration. No trained checkpoint is bundled."
    ),
    lifespan=lifespan,
)

# Configure CORS with configurable environment variable support
ALLOWED_ORIGINS_ENV = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
)
ALLOWED_ORIGINS = [orig.strip() for orig in ALLOWED_ORIGINS_ENV.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Enforce standard enterprise security headers on all responses."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


class FlowInput(BaseModel):
    device_id: str = Field(default="edge-gateway-07", min_length=2, max_length=48)
    protocol: Literal["TCP", "UDP", "ICMP", "HTTP", "MQTT"] = "TCP"
    packets_per_second: float = Field(default=84, ge=0, le=100_000)
    failed_connections: int = Field(default=0, ge=0, le=100_000)
    unique_destination_ports: int = Field(default=1, ge=0, le=65_535)
    payload_entropy: float = Field(default=4.2, ge=0, le=8)
    icmp_share: float = Field(default=0.05, ge=0, le=1)



def classify_demo(flow: FlowInput) -> tuple[str, int, str]:
    """A deliberately transparent demo heuristic, not the project's trained MLP."""
    if flow.unique_destination_ports >= 18:
        score = min(97, 68 + round((flow.unique_destination_ports - 18) * 0.45))
        return "Port_Scanning", score, "Destination-port fan-out exceeded the demo threshold."
    if flow.protocol == "ICMP" and flow.icmp_share >= 0.65 and flow.packets_per_second >= 160:
        score = min(96, 68 + round((flow.packets_per_second - 160) / 24))
        return "DDoS_ICMP", score, "High-rate ICMP traffic crossed the demo threshold."
    if flow.failed_connections >= 14 and flow.packets_per_second >= 25:
        score = min(95, 67 + round((flow.failed_connections - 14) * 0.8))
        return "Password", score, "Repeated failed connections crossed the demo threshold."
    if flow.payload_entropy >= 7.2:
        return "XSS", min(94, 68 + round((flow.payload_entropy - 7.2) * 18)), "High payload entropy crossed the demo threshold."
    if flow.packets_per_second >= 450:
        return "DDoS_TCP", min(96, 68 + round((flow.packets_per_second - 450) / 25)), "Packet rate crossed the demo threshold."
    return "Normal", max(6, min(42, round(flow.packets_per_second / 14 + flow.failed_connections * 1.4))), "No demo rule threshold was crossed."


def make_event(flow: FlowInput, sequence: int, origin: str = "Synthetic telemetry") -> dict:
    label, score, reason = classify_demo(flow)
    alert = score >= 68
    return {
        "id": f"evt-{sequence:06d}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "device_id": flow.device_id,
        "protocol": flow.protocol,
        "packets_per_second": round(flow.packets_per_second, 1),
        "failed_connections": flow.failed_connections,
        "unique_destination_ports": flow.unique_destination_ports,
        "predicted_class": label,
        "anomaly_score": score,
        "alert": alert,
        "severity": "High" if score >= 84 else "Medium" if alert else "Low",
        "reason": reason,
        "origin": origin,
        "inference_mode": "transparent_demo_rule_based",
    }


def demo_flow(sequence: int) -> FlowInput:
    """Repeatable mix of ordinary and anomalous demo flows for the live-monitor UI."""
    cases = [
        FlowInput(device_id="edge-gateway-07", protocol="TCP", packets_per_second=61, failed_connections=1, unique_destination_ports=1, payload_entropy=3.8),
        FlowInput(device_id="plant-sensor-12", protocol="UDP", packets_per_second=93, failed_connections=2, unique_destination_ports=3, payload_entropy=4.1),
        FlowInput(device_id="clinic-router-03", protocol="ICMP", packets_per_second=720, failed_connections=0, unique_destination_ports=2, payload_entropy=2.7, icmp_share=0.92),
        FlowInput(device_id="building-hub-22", protocol="TCP", packets_per_second=44, failed_connections=31, unique_destination_ports=2, payload_entropy=4.4),
        FlowInput(device_id="line-controller-05", protocol="HTTP", packets_per_second=115, failed_connections=3, unique_destination_ports=34, payload_entropy=5.1),
        FlowInput(device_id="edge-gateway-18", protocol="MQTT", packets_per_second=26, failed_connections=0, unique_destination_ports=1, payload_entropy=3.4),
        FlowInput(device_id="clinic-router-09", protocol="TCP", packets_per_second=520, failed_connections=5, unique_destination_ports=4, payload_entropy=4.9),
    ]
    return cases[(sequence - 1) % len(cases)]


EVENTS: deque[dict] = deque(maxlen=160)
_sequence = 0
producer_task: asyncio.Task | None = None


def append_demo_event() -> dict:
    global _sequence
    _sequence += 1
    event = make_event(demo_flow(_sequence), _sequence)
    EVENTS.appendleft(event)
    return event


async def stream_producer() -> None:
    while True:
        await asyncio.sleep(3.6)
        append_demo_event()


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "Northstar IoT Security API",
        "mode": "experiment_dashboard_plus_demo_inference",
        "trained_model_loaded": False,
        "live_stream": "synthetic_demo_telemetry",
    }


@app.get("/api/overview")
def overview() -> dict:
    return {
        "dataset": COMPARISON["dataset"],
        "task": COMPARISON["task"],
        "created_utc": COMPARISON["created_utc"],
        "test_rows": COMPARISON["test_rows"],
        "test_used_for_training_or_selection": COMPARISON["test_used_for_training_or_selection"],
        "all_runs_share_same_test_split_and_source": COMPARISON["all_runs_share_same_test_split_and_source"],
        "provenance": COMPARISON["data_provenance"],
        "experiment_count": len(EXPERIMENTS),
        "default_experiment": DEFAULT_EXPERIMENT,
        "limitations": [
            "Federated results come from a single-machine simulation over partitions of the same dataset.",
            "Differential privacy and secure aggregation are not implemented.",
            "Estimated tensor traffic is not measured network traffic.",
            "The saved row-level test split does not establish generalization to unseen captures, devices, or organizations.",
            "No trained inference checkpoint or live packet feed is bundled with this dashboard.",
        ],
    }


@app.get("/api/experiments")
def experiments() -> dict:
    records = []
    for record in EXPERIMENTS:
        records.append({
            "experiment_name": record["experiment_name"],
            "model_type": record["model_type"],
            "algorithm": record["algorithm"],
            "partition_scheme": record["partition_scheme"],
            "task": record["task"],
            "metrics": record["classification_metrics"],
            "training_seconds": record["training_seconds"],
            "end_to_end_experiment_seconds": record["end_to_end_experiment_seconds"],
            "communication_total_parameter_bytes": record["communication_total_parameter_bytes"],
            "communication_client_to_server_bytes": record["communication_client_to_server_bytes"],
            "communication_server_to_client_bytes": record["communication_server_to_client_bytes"],
            "train_client_failures": record["train_client_failures"],
            "validation_client_failures": record["validation_client_failures"],
            "train_client_messages_expected": record["train_client_messages_expected"],
            "validation_client_messages_expected": record["validation_client_messages_expected"],
            "validation_trajectory": record["validation_trajectory"],
            "best_validation_round_or_epoch": record["best_validation_round_or_epoch"],
            "best_validation_macro_f1": record["best_validation_macro_f1"],
            "test_rows": record["test_rows"],
            "test_used_for_training_or_selection": record["test_used_for_training_or_selection"],
        })
    return {"records": records}


@app.get("/api/experiments/{experiment_name}")
def experiment_detail(experiment_name: str) -> dict:
    record = EXPERIMENT_BY_ID.get(experiment_name)
    if not record:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return record


@app.get("/api/classes")
def class_metrics(experiment: str = Query(DEFAULT_EXPERIMENT)) -> dict:
    if experiment not in EXPERIMENT_BY_ID:
        raise HTTPException(status_code=404, detail="Experiment not found")
    rows = []
    with (DATA_DIR / "phase2_federated_class_metrics.csv").open(newline="", encoding="utf-8") as source:
        for row in csv.DictReader(source):
            if row["experiment_name"] == experiment:
                rows.append({
                    "class_name": row["class"],
                    "support": int(row["support"]),
                    "precision": float(row["precision"]),
                    "recall": float(row["recall"]),
                    "f1": float(row["f1"]),
                })
    rows.sort(key=lambda item: item["support"], reverse=True)
    return {"experiment_name": experiment, "records": rows}


@app.get("/api/simulation")
def simulation() -> dict:
    return {
        "mode": "historical_single_machine_simulation",
        "algorithm": "Flower / PyTorch",
        "clients": ORGANIZATIONS,
        "client_count": len(ORGANIZATIONS),
        "rounds": 4,
        "local_epochs_per_round": 1,
        "batch_size": 4096,
        "dirichlet_alpha": 0.3,
        "fedprox_mu": 0.01,
        "participation": "full",
        "train_rows_per_run": 1_553_443,
        "validation_rows_per_run": 332_882,
        "global_test_rows": 332_876,
        "expected_train_messages_per_federated_run": 12,
        "expected_validation_messages_per_federated_run": 12,
        "observed_client_failures": 0,
        "privacy_features": {"differential_privacy": False, "secure_aggregation": False},
        "communication_note": "Tensor-size estimate only; protocol overhead and actual network traffic are not measured.",
    }


@app.get("/api/stream")
def live_stream(limit: int = Query(35, ge=1, le=100)) -> dict:
    events = list(EVENTS)[:limit]
    flagged = sum(1 for event in EVENTS if event["alert"])
    return {
        "mode": "synthetic_demo_telemetry",
        "inference_mode": "transparent_demo_rule_based",
        "trained_model_loaded": False,
        "events": events,
        "total_events_in_memory": len(EVENTS),
        "flagged_events_in_memory": flagged,
        "last_event_at": events[0]["timestamp"] if events else None,
        "refresh_interval_seconds": 3.6,
    }


@app.post("/api/inference")
def infer(flow: FlowInput) -> dict:
    global _sequence
    _sequence += 1
    event = make_event(flow, _sequence, "Operator submitted")
    EVENTS.appendleft(event)
    return {
        **event,
        "prediction_basis": "Transparent threshold rules over the submitted telemetry fields; not the Edge-IIoTset MLP.",
        "score_semantics": "Heuristic anomaly score, not calibrated model probability or confidence.",
        "trained_model_loaded": False,
    }


@app.get("/api/metadata")
def metadata() -> dict:
    return {
        "feature_policy_version": "edge-iiotset-phase1-core-v2",
        "raw_model_feature_count": 31,
        "transformed_feature_count": 38,
        "model_architecture": "128 × 64 MLP",
        "class_count": 15,
        "training_data": "Edge-IIoTset Phase 1 v3",
        "model_artifact_available": False,
        "model_artifact_note": "The source project README and Phase 2 bundle do not include the trained checkpoint or preprocessor required for actual inference.",
    }


@app.get("/api/experiment-report")
def experiment_report() -> FileResponse:
    report_file = DATA_DIR / "phase2_federated_comparison.md"
    if not report_file.exists():
        raise HTTPException(status_code=404, detail="Experiment report not found")
    return FileResponse(report_file, media_type="text/markdown", filename="phase2_federated_comparison.md")


# Serve frontend static assets (JS, CSS, images, etc.)
if FRONTEND_DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        """Serve static files from FRONTEND_DIST, or index.html for SPA routes."""
        # 1. Serve root static assets (favicon.ico, PNG icons, brand-mark.svg, etc.)
        candidate = FRONTEND_DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)

        # 2. Serve index.html for all client-side SPA routing fallback
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(index_file, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
        return JSONResponse(
            {"detail": "Frontend not built. Run npm --prefix frontend run build."},
            status_code=503
        )
else:
    @app.get("/", include_in_schema=False)
    def frontend_not_built() -> JSONResponse:
        return JSONResponse({"detail": "Frontend assets are not built yet. Run npm --prefix frontend run build."}, status_code=503)
