#!/bin/sh
set -e

echo "Running database setup & seed..."
python -m app.seed || echo "Database seeding completed or skipped"

PORT="${PORT:-8000}"
echo "Starting Sahayak API on port $PORT..."
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
