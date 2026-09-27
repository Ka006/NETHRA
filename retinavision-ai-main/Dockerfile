# Multi-stage Dockerfile for RetinaVision AI (Frontend + PyTorch Backend)

# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Runtime with CPU-optimized PyTorch
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements (CPU torch wheel for fast build and low memory footprint)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir fastapi uvicorn pillow numpy python-multipart

# Copy application assets, model weights, and source code
COPY main.py .
COPY model.pth .
COPY models/ ./models/
COPY backend/ ./backend/

# Copy compiled frontend distribution from builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV PORT=8000
EXPOSE 8000

CMD ["python", "main.py"]
