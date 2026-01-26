#!/bin/bash
set -e

echo "Starting Beetbox..."
echo "Music path: $MUSIC_PATH"
echo "Database: $BEETS_DB_PATH"

# Start nginx in background
echo "Starting nginx..."
nginx

# Start gunicorn for the Flask API
echo "Starting Flask API on port $PORT..."
cd /app/backend
exec gunicorn \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --threads 4 \
    --timeout 300 \
    --access-logfile - \
    --error-logfile - \
    app:app
