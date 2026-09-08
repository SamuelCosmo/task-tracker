# Task Tracker

A full-stack task management app built as a hands-on learning project — a single CRUD app deliberately extended to cover Docker, PostgreSQL, Prisma, GraphQL, and Next.js Server-Side Rendering in one working codebase.

## Features

- Full CRUD for tasks (create, read, update, delete)
- REST API and GraphQL API exposed side by side, backed by the same database
- Server-side rendering (SSR) on the initial page load, with client-side interactivity for everything after
- Persistent PostgreSQL storage via Prisma ORM
- Fully containerized with Docker — three services (frontend, backend, database) started with a single command

## Tech Stack

**Frontend:** Next.js (App Router, TypeScript) — Server Components for data fetching, Client Components for interactivity

**Backend:** Node.js, Express, Apollo Server (GraphQL)

**Database:** PostgreSQL, accessed via Prisma ORM

**Infrastructure:** Docker, Docker Compose

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  frontend   │      │   backend   │      │     db      │
│  Next.js    │─────▶│   Express   │─────▶│  PostgreSQL │
│  :3000      │      │   :4200     │      │   :5432     │
└─────────────┘      └─────────────┘      └─────────────┘
```

Each service runs in its own container, defined in `docker-compose.yml`. The `backend` exposes both a REST API (`/tasks`) and a GraphQL API (`/graphql`) over the same Prisma/PostgreSQL data layer. The `frontend` fetches data server-side on initial load and hands off to client-side components for all interactive actions.

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Running with Docker (recommended)

Clone the repo, then from the project root:

```bash
docker compose up --build
```

Once all three services are running, apply the database migration (first run only):

```bash
docker compose exec backend pnpm prisma migrate deploy
```

Open the app:

- Frontend: [http://localhost:3000](http://localhost:3000)
- REST API: [http://localhost:4200/tasks](http://localhost:4200/tasks)
- GraphQL Playground: [http://localhost:4200/graphql](http://localhost:4200/graphql)

### Environment Variables

These are already set inside `docker-compose.yml` for local development and don't need to be created manually to run the app via Docker. For reference, the variables involved are:

| Variable | Used by | Purpose |
|---|---|---|
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `API_URL` | frontend (server-side) | Backend address reachable from inside the Docker network |
| `NEXT_PUBLIC_API_URL` | frontend (build-time, browser-side) | Backend address reachable from the browser |

## API

### REST

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks` | List all tasks |
| `POST` | `/tasks` | Create a task (`{ "title": string }`) |
| `PUT` | `/tasks/:id` | Update a task (`{ "title"?: string, "done"?: boolean }`) |
| `DELETE` | `/tasks/:id` | Delete a task |

### GraphQL

Available at `/graphql`. Example query and mutation:

```graphql
query {
  tasks {
    id
    title
    done
  }
}

mutation {
  addTask(title: "Learn GraphQL") {
    id
    title
    done
  }
}
```

## Project Structure

```
task-tracker/
├── client/              # Next.js frontend
├── server/              # Express backend (REST + GraphQL)
│   └── prisma/          # Database schema and migrations
├── docker-compose.yml   # Orchestrates all three services
└── README.md
```

## Roadmap

- [x] REST CRUD API
- [x] PostgreSQL + Prisma ORM
- [x] Dockerized (backend, frontend, database)
- [x] GraphQL API alongside REST
- [x] Images published to Docker Hub
- [ ] Automated tests (Jest)
- [ ] CI/CD pipeline (GitHub Actions + SonarCloud)