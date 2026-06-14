[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&style=flat-square)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite&style=flat-square)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-green?logo=node.js&style=flat-square)](https://nodejs.org/)
[![License](https://img.shields.io/github/license/forge34/messaging-app-frontend?style=flat-square)](./LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/forge34/messaging-app-frontend?style=flat-square)](https://github.com/forge34/messaging-app-frontend/commits/main)
[![GitHub issues](https://img.shields.io/github/issues/forge34/messaging-app-frontend?style=flat-square)](https://github.com/forge34/messaging-app-frontend/issues)

# Messaging App

Messaging App is a real-time communication system built around WebSocket-based event streaming. It allows authenticated users to exchange messages instantly, with support for message lifecycle tracking, presence detection, typing indicators, and read receipts.

The application follows an event-driven architecture where the backend acts as the source of truth, ensuring consistent state synchronization across all connected clients in real time.

## Tech Stack

* **Frontend:** React, Vite, Tailwind CSS , Tanstack Query, Tanstack Router, Socket.io-client, Shadcn UI.
* **Backend:** NestJS, Express, Socket.io, Passport (JWT authentication), bcryptjs.
* **Database & ORM:** PostgreSQL, Prisma, Zod.
* **Tooling:** pnpm, ESLint, Prettier, TypeScript, Docker.


## Prerequisites

To run this project locally, ensure you have the following installed:

* **Node.js** (v22 or newer recommended)
* **pnpm** (v10.x or newer)
* **Docker & Docker Compose** 

## Environment Variables

Create a `.env` file in the root of the project to configure your environment. Use the provided variables below:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=messaging-app

PORT=3000

DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
SECRET="JWTSECRET"

```

or `cp example.env .env` 

## Local Development Setup

1. **Clone the repository:**
```sh
git clone https://github.com/forge34/messaging-app-frontend.git
cd messaging-app-frontend

```


2. **Install dependencies:**
```sh
pnpm install

```


3. **Start the database container:**
```sh
docker compose up db -d

```


4. **Initialize the database:**
Run Prisma migrations and generate the database client.
```sh
pnpm db:migrate
pnpm db:generate

```


5. **Start the development servers:**
This command spins up the client, server, and builds local packages in parallel.
```sh
pnpm dev

```



The client will be available at `http://localhost:5173` (Vite's default port), and the API server will be running at `http://localhost:3000`.

## Available Scripts

Run these commands from the root directory using `pnpm <command>`.

| Command | Action |
| --- | --- |
| `dev` | Starts all apps and packages in development mode simultaneously. |
| `build` | Builds all applications and packages for production. |
| `db:generate` | Generates the Prisma Client inside `@chat/db`. |
| `db:migrate` | Applies pending database migrations. |
| `db:reset` | Drops the database and applies all migrations from scratch. |
| `db:studio` | Opens Prisma Studio to view and edit database records visually. |
| `dev:server` | Starts only the NestJS backend in watch mode. |
| `dev:client` | Starts only the React frontend. |

## Production & Docker

The project includes a `compose.yaml` configuration to run the application using Docker containers.

To start the production environment:

```sh
docker compose up -d

```

This configuration provisions:

* A `db` service running PostgreSQL 18.2 with persistent volume storage (`pgdata`).
* A `server` service pulling the frontend/backend container image from the GitHub Container Registry (`ghcr.io/forge34/messaging-app-frontend:latest`).

- `VITE_API` should be set to the base URL of your backend API (for local development, this is usually `http://localhost:3000`, but it should match wherever your backend is running).
- All environment variables used by Vite must be prefixed with `VITE_`.
- If you deploy the frontend to production, update the value to your production backend endpoint.
