# Beetbox - Multi-stage Docker build
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Stage 2: Production image
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/dist /app/static

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy startup script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Create directories for volumes
RUN mkdir -p /music /data

# Environment variables with defaults
ENV MUSIC_PATH=/music \
    BEETS_DB_PATH=/data/library.db \
    HOST=0.0.0.0 \
    PORT=8337 \
    READONLY=true \
    INCLUDE_PATHS=false \
    CORS_ORIGIN=*

# Expose ports
EXPOSE 80 8337

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8337/health || exit 1

# Start both nginx and gunicorn
CMD ["/start.sh"]
