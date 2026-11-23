# =============================================================================
# Stage 1: Build the React / TypeScript frontend SPA
# =============================================================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy dependency manifests and install exact dependencies
COPY frontend/package*.json frontend/.npmrc* ./
RUN npm ci

# Copy frontend source code and compile production assets
COPY frontend/ ./
RUN npm run build

# =============================================================================
# Stage 2: Production Python runtime for FastAPI backend
# =============================================================================
FROM python:3.12-slim AS runner

WORKDIR /app

# Optimize Python execution in containers
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=10000

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code and benchmark datasets
COPY backend/ ./backend/

# Copy compiled frontend distribution from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose Render default web service port
EXPOSE 10000

# Launch FastAPI using Uvicorn; PORT is evaluated dynamically from Render environment
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
