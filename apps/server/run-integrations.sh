#!/usr/bin/env bash
set -e

# Load test env
export $(grep -v '^#' .test.env | xargs)

# Start temporary Postgres container on port 5433
POSTGRES_CONTAINER_NAME="test-postgres"

docker run -d \
  --name $POSTGRES_CONTAINER_NAME \
  -e POSTGRES_USER=$POSTGRES_USER \
  -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -e POSTGRES_DB=$POSTGRES_DB \
  -p 5433:5432 \
  postgres:16

# Wait for Postgres to be ready
echo "Waiting for Postgres on port 5433..."
until docker exec $POSTGRES_CONTAINER_NAME pg_isready -U $POSTGRES_USER; do
  sleep 1
done

# Run Prisma push
npx prisma db push

# Run tests
npx vitest --coverage
npm run test

# Clean up
docker stop $POSTGRES_CONTAINER_NAME
docker rm $POSTGRES_CONTAINER_NAME
