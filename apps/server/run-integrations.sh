#!/usr/bin/env bash
set -e

export $(grep -v '^#' .test.env | xargs)

POSTGRES_CONTAINER_NAME="test-postgres"

function cleanse() {
  echo 'Stopping container'
  docker stop $POSTGRES_CONTAINER_NAME
  echo 'Removing container'
  docker rm $POSTGRES_CONTAINER_NAME
}

docker run -d \
  --name $POSTGRES_CONTAINER_NAME \
  -e POSTGRES_USER="$POSTGRES_USER" \
  -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  -e POSTGRES_DB="$POSTGRES_DB" \
  -p 5433:5432 \
  postgres:16

trap cleanse EXIT

echo "Waiting for Postgres on port 5433..."
until docker exec $POSTGRES_CONTAINER_NAME pg_isready -U $POSTGRES_USER; do
  sleep 1
done

pnpm --filter @chat/db db:push
pnpx vitest --run --coverage
