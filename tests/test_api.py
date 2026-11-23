from fastapi.testclient import TestClient

from backend.main import app


def test_health_is_honest_about_inference_mode() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        payload = response.json()
        assert payload["trained_model_loaded"] is False
        assert payload["live_stream"] == "synthetic_demo_telemetry"


def test_overview_and_experiments_use_the_verified_test_split() -> None:
    with TestClient(app) as client:
        overview = client.get("/api/overview").json()
        experiments = client.get("/api/experiments").json()["records"]
        assert overview["dataset"] == "Edge-IIoTset Phase 1 v3 processed split"
        assert overview["test_rows"] == 332_876
        assert overview["test_used_for_training_or_selection"] is False
        assert len(experiments) == 5
        fedavg_iid = next(row for row in experiments if row["experiment_name"] == "phase2-fedavg-iid-multiclass")
        assert round(fedavg_iid["metrics"]["f1_macro"], 4) == 0.3480
        assert fedavg_iid["communication_total_parameter_bytes"] == 1_365_408


def test_class_metrics_and_simulation_facts_are_present() -> None:
    with TestClient(app) as client:
        classes = client.get("/api/classes?experiment=central_mlp_v3_128x64_multiclass").json()["records"]
        simulation = client.get("/api/simulation").json()
        assert len(classes) == 15
        assert any(row["class_name"] == "DDoS_ICMP" and row["recall"] == 0 for row in classes)
        assert simulation["client_count"] == 3
        assert simulation["rounds"] == 4
        assert simulation["privacy_features"] == {"differential_privacy": False, "secure_aggregation": False}


def test_manual_inference_is_labeled_as_heuristic_and_adds_alert() -> None:
    flow = {
        "device_id": "test-gateway",
        "protocol": "TCP",
        "packets_per_second": 60,
        "failed_connections": 24,
        "unique_destination_ports": 1,
        "payload_entropy": 4.1,
        "icmp_share": 0.02,
    }
    with TestClient(app) as client:
        result = client.post("/api/inference", json=flow)
        assert result.status_code == 200
        payload = result.json()
        assert payload["predicted_class"] == "Password"
        assert payload["alert"] is True
        assert payload["trained_model_loaded"] is False
        assert payload["score_semantics"].startswith("Heuristic anomaly score")
        recent = client.get("/api/stream").json()["events"]
        assert any(event["id"] == payload["id"] and event["origin"] == "Operator submitted" for event in recent)


def test_invalid_flow_values_are_rejected() -> None:
    with TestClient(app) as client:
        result = client.post("/api/inference", json={"protocol": "TCP", "packets_per_second": -1})
        assert result.status_code == 422
