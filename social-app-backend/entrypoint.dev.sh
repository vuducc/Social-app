#!/bin/bash

# Chờ cho PostgreSQL khởi động
echo "Waiting for PostgreSQL to start..."
while ! nc -z postgres 5432; do
    sleep 0.1
done
echo "PostgreSQL started"

# Tạo extension uuid-ossp với biến môi trường
echo "Creating uuid-ossp extension..."
PGPASSWORD=${POSTGRES_PASSWORD} psql -h ${POSTGRES_HOST} -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'

# Chạy migrations
echo "Running database migrations..."
alembic upgrade head

# Khởi động ứng dụng với uvicorn reload mode
echo "Starting application in development mode..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload --reload-dir /backend
