#!/usr/bin/env bash

# Load test env
export $(grep -v '^#' .test.env | xargs)

# Start services and run Prisma commands
docker compose -f ./docker-compose.yml up -d
npx dotenv -e .test.env -- npx prisma db push
npm run test
