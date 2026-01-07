# Docley-WebApp Monorepo

Welcome to the Docley-WebApp repository. This project is divided into two main components:

- **docley/**: The React-based frontend application (Vite).
- **server/**: The NestJS-based backend API.

## Project Structure

```text
.
├── Docley/         # Frontend Application
├── server/         # Backend Application
├── package.json    # Root scripts for the monorepo
└── README.md       # This file
```

## Getting Started

To install dependencies for both the frontend and backend, run:

```bash
npm run install:all
```

To start both the frontend and backend in development mode, run:

```bash
npm run dev:all
```

## Environment Variables

Ensure you have `.env` files in both the `Docley/` and `server/` directories. Refer to the respective `.env.example` files in each directory for required variables.
