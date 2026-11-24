# IoTGuard — IoT Security Observability Platform

An interactive platform for exploring IoT security experiments, monitoring system activity, and comparing centralized and federated machine learning performance.

**Live Demo:** [https://iotguard-j42p.onrender.com](https://iotguard-j42p.onrender.com)

**GitHub Repository:** [https://github.com/Vaish1017/IoTGuard](https://github.com/Vaish1017/IoTGuard)

---

## About

IoTGuard is a web-based platform designed to simplify the exploration of IoT security experiments and machine learning results.

It provides two main sections:

- **Dashboard:** Displays security status, active sensors, recent alerts, connected devices, network activity, and system health.
- **Observability:** Presents experiment details, attack classifications, model metadata, and centralized vs. federated learning comparisons.

## Features

- Interactive security monitoring dashboard
- Experiment tracking and analysis
- Centralized vs. federated model comparison
- Performance metrics: Accuracy, Balanced Accuracy, Macro F1, ROC AUC
- Training time and communication rounds
- Interactive charts and visualizations
- Responsive UI with light and dark themes
- FastAPI backend and REST API

## Technology Stack

| Component        | Technologies             |
| ---------------- | ------------------------ |
| Frontend         | React, TypeScript, Vite  |
| Backend          | Python, FastAPI, Uvicorn |
| Styling          | CSS                      |
| Machine Learning | Scikit-learn             |
| Visualization    | Plotly                   |
| Deployment       | Render, Docker           |
| Version Control  | Git, GitHub              |

## Project Structure

```
IoTGuard/
├── backend/
│   ├── main.py
│   └── data/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── views/
│       ├── App.tsx
│       └── styles.css
├── requirements.txt
├── Dockerfile
├── .dockerignore
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.12
- Node.js
- npm
- Git

### 1. Clone the Repository

```
git clone https://github.com/Vaish1017/IoTGuard.git
cd IoTGuard
```

### 2. Set Up the Backend

```
python -m venv venv
```

Activate the environment on Windows:

```
.\venv\Scripts\Activate.ps1
```

Install dependencies and start the server:

```
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

Backend: `http://127.0.0.1:8000`

### 3. Set Up the Frontend

Open another terminal:

```
cd frontend
npm ci
npm run dev
```

Open the local URL provided by Vite.

## API Endpoints

| Endpoint                 | Description                |
| ------------------------ | -------------------------- |
| `/api/health`            | Backend health check       |
| `/api/overview`          | Dashboard overview         |
| `/api/experiments`       | Experiment information     |
| `/api/classes`           | Class information          |
| `/api/simulation`        | Simulation functionality   |
| `/api/stream`            | Activity stream            |
| `/api/metadata`          | Model and dataset metadata |
| `/api/experiment-report` | Experiment report          |

API documentation: `http://127.0.0.1:8000/docs`

## Deployment

IoTGuard is deployed on Render using Docker, with the FastAPI backend serving the production-built frontend.

**Live Application:** [https://iotguard-j42p.onrender.com](https://iotguard-j42p.onrender.com)

*Note: The free Render instance may take some time to respond after inactivity.*

## Limitations

- Experimental results depend on the available dataset and evaluation settings.
- Dashboard visualizations should not be interpreted as real-time monitoring of physical IoT devices.
- Model performance in experiments does not guarantee equivalent real-world performance.
---
                        IoTGuard — Making IoT Security Experiments Easier to Explore
 
