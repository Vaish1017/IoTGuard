# Phase 2: Federated versus centralized model comparison

Generated: 2026-11-20T09:12:59.645216+00:00

All 5 models use the same Phase 1 v3 held-out multiclass test split (332,876 rows). The builder verified matching source, preprocessor, and processed-manifest hashes. Client shards contain training and validation data only; the test split was used for final evaluation and not for model selection.

> **Note**: Validation macro-F1 convergence trajectories are tabulated per experiment below and visualized interactively in the IoTGuard Analytics dashboard.

## Test classification metrics

Each run below reports the same metric definitions. The per-class precision, recall, F1, and support values are in the linked CSV artifact.

### central_mlp_v3_128x64_multiclass

centralized / centralized; test accuracy 0.7882, balanced accuracy 0.4419, macro precision 0.5834, macro recall 0.4419, macro-F1 0.4174, weighted-F1 0.7679.
ROC-AUC macro OVR 0.9001; PR-AUC macro average precision OVR 0.4247; test cross-entropy n/a.
Training time 64.8s; end-to-end time 64.8s. Best recorded validation macro-F1 0.4208 at epoch 4; validation trajectory 1:0.3295, 2:0.3667, 3:0.4071, 4:0.4208, 5:0.4131, 6:0.4114, 7:0.4141, 8:0.4165.
Estimated model-parameter traffic 0 bytes total (0 server-to-client and 0 client-to-server); observed client failures 0 training and 0 validation out of 0 expected requests in each category.

### phase2-fedavg-iid-multiclass

fedavg / iid; test accuracy 0.8163, balanced accuracy 0.3594, macro precision 0.5650, macro recall 0.3594, macro-F1 0.3480, weighted-F1 0.7689.
ROC-AUC macro OVR 0.8769; PR-AUC macro average precision OVR 0.3851; test cross-entropy 0.7822.
Training time 49.8s; end-to-end time 68.6s. Best recorded validation macro-F1 0.3416 at round 4; validation trajectory 0:0.0041, 1:0.2524, 2:0.2949, 3:0.3256, 4:0.3416.
Estimated model-parameter traffic 1,365,408 bytes total (682,704 server-to-client and 682,704 client-to-server); observed client failures 0 training and 0 validation out of 12 expected requests in each category.

### phase2-fedavg-dirichlet-multiclass

fedavg / dirichlet; test accuracy 0.7976, balanced accuracy 0.3147, macro precision 0.3146, macro recall 0.3147, macro-F1 0.2848, weighted-F1 0.7483.
ROC-AUC macro OVR 0.8794; PR-AUC macro average precision OVR 0.3854; test cross-entropy 0.8095.
Training time 57.7s; end-to-end time 76.1s. Best recorded validation macro-F1 0.2851 at round 4; validation trajectory 0:0.0041, 1:0.1484, 2:0.2504, 3:0.2627, 4:0.2851.
Estimated model-parameter traffic 1,365,408 bytes total (682,704 server-to-client and 682,704 client-to-server); observed client failures 0 training and 0 validation out of 12 expected requests in each category.

### phase2-fedprox-iid-multiclass

fedprox / iid; test accuracy 0.8120, balanced accuracy 0.3518, macro precision 0.4193, macro recall 0.3518, macro-F1 0.3308, weighted-F1 0.7623.
ROC-AUC macro OVR 0.8731; PR-AUC macro average precision OVR 0.3769; test cross-entropy 0.7846.
Training time 49.1s; end-to-end time 67.2s. Best recorded validation macro-F1 0.3272 at round 3; validation trajectory 0:0.0041, 1:0.2022, 2:0.2794, 3:0.3272, 4:0.3266.
Estimated model-parameter traffic 1,365,408 bytes total (682,704 server-to-client and 682,704 client-to-server); observed client failures 0 training and 0 validation out of 12 expected requests in each category.

### phase2-fedprox-dirichlet-multiclass

fedprox / dirichlet; test accuracy 0.8028, balanced accuracy 0.2864, macro precision 0.2359, macro recall 0.2864, macro-F1 0.2458, weighted-F1 0.7417.
ROC-AUC macro OVR 0.8760; PR-AUC macro average precision OVR 0.3681; test cross-entropy 0.7658.
Training time 58.0s; end-to-end time 76.7s. Best recorded validation macro-F1 0.2465 at round 4; validation trajectory 0:0.0041, 1:0.1495, 2:0.2333, 3:0.2443, 4:0.2465.
Estimated model-parameter traffic 1,365,408 bytes total (682,704 server-to-client and 682,704 client-to-server); observed client failures 0 training and 0 validation out of 12 expected requests in each category.

## Interpretation notes

The centralized reference is the Phase 1 MLP checkpoint selected by validation macro-F1. The federated runs use the same 128×64 MLP architecture. Each run's actual communication-round count, local epochs, batch size, proximal coefficient, and Dirichlet alpha are recorded in the JSON detail file and the experiment directory. The Dirichlet alpha and FedProx coefficient are also recorded in each client-partition manifest and run configuration.

Communication totals are estimated from serialized model parameter tensor sizes returned by the simulation. They are not measured network traffic and exclude protocol framing, metadata, retries, compression, and runtime overhead. This is a single-machine simulation over transformed feature arrays; it does not demonstrate cross-organization data isolation, differential privacy, or secure aggregation.

## Supporting files

- Detailed run records and provenance: `phase2_federated_comparison.json`
- Per-class results for all configurations: `phase2_federated_class_metrics.csv`
