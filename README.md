# JobTracker

A job application tracking dashboard built with React, Vite, Tailwind CSS, and Supabase.

**[Live Demo](https://job-tracker-seven-self.vercel.app)** | **[Getting Started](#getting-started)** | **[Quality Checks](#quality-checks)**

## Overview

JobTracker helps users save and manage job applications in one place. The app includes authentication, protected routes, Supabase-backed persistence, form validation, search/filtering, and a responsive dashboard UI.

This repository is intended to demonstrate practical frontend engineering habits: clear component boundaries, incremental refactoring, focused tests, database migrations, and a maintainable project structure.

## Engineering Highlights

- **Authenticated user flows** with Supabase Auth and protected dashboard routes
- **Supabase persistence** with Row Level Security so users can only access their own applications
- **Service layer** that maps between app-facing camelCase models and database snake_case rows
- **Reusable UI primitives** for form fields, modals, cards, empty states, and layout structure
- **Focused validation and utility tests** for application data, website normalization, and service behavior
- **Quality workflow** with ESLint, Vitest, GitHub Actions, Husky, and lint-staged
- **Incremental Git history** using focused branches, conventional commits, and PR-based changes

## Tech Stack

| Area             | Tools                                      |
| ---------------- | ------------------------------------------ |
| Frontend         | React, Vite                                |
| Styling          | Tailwind CSS                               |
| Routing          | React Router                               |
| Backend services | Supabase Auth, Supabase Database           |
| Testing          | Vitest, React Testing Library              |
| Quality          | ESLint, Husky, lint-staged, GitHub Actions |
| Icons            | Lucide React                               |

## Getting Started

Use **Node.js 24.x** with its bundled npm for local development. The locked development tooling includes `lint-staged`, which requires Node.js 22.22.1 or newer.

The [CI workflow](.github/workflows/ci.yml) currently selects Node.js 20; updating CI to the recommended Node.js 24.x runtime is still pending.

```bash
git clone https://github.com/simbongile-mkhotheli/JobTracker.git
cd JobTracker
npm ci
```

`npm ci` installs the dependencies recorded in `package-lock.json`, matching CI's installation command.

Create `.env.local` using the variables below, then start the dev server:

```bash
npm run dev
```

Visit `http://localhost:5173` after the dev server starts.

## Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Use the Supabase project URL for `VITE_SUPABASE_URL` such as `https://your-project-id.supabase.co`, not the `/rest/v1/` endpoint.

Restart the dev server after changing environment variables.

## Project Structure

```txt
src/
|-- App.jsx              # Root route configuration
|-- main.jsx             # React entry point
|-- components/          # Reusable UI and feature components
|   |-- auth/            # Auth-related route guards
|   `-- ui/              # Shared UI primitives
|-- contexts/            # React context providers
|-- hooks/               # Custom React hooks
|-- layouts/             # Page layout wrappers
|-- lib/                 # Third-party client setup
|-- pages/               # Route-level screens
|-- services/            # Supabase data access
|-- styles/              # Shared style constants
|-- test/                # Test setup
|-- utils/               # Validation and business helpers
`-- constants/           # Shared app constants
```

## Architecture Notes

- `useApplications` owns dashboard state and coordinates application CRUD actions.
- `applicationService` isolates Supabase queries and handles database-to-app model mapping.
- Form validation lives in shared utilities so it can be tested outside the UI.
- Database documentation distinguishes the deployed schema from historical migration SQL.
- Components are kept mostly presentational, with data access pushed into hooks and services.

## Database Schema

**Migration execution is prohibited pending baseline reconciliation.** This is a
documented rule, not a technical block. Production repair `20261102122254` is
already recorded in Supabase, with its exact SQL archived outside the active
migration directory. Historical migration files are not an accurate production
baseline; do not replay them or mark them applied.

See the [deployed schema](docs/supabase-schema.md) and
[security repair record and migration warnings](docs/database-migrations.md).

The `applications` table uses Row Level Security policies so authenticated users can only read and mutate their own records.

## Quality Checks

Run the same checks as CI, in this order, before opening a PR:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

These commands run ESLint, the TypeScript compiler without emitting files, Vitest in non-watch mode, and the Vite production build. Typecheck is separate because the build command does not run the TypeScript compiler.

Current automated coverage focuses on:

- Authentication session loading, auth state changes, and login/signup success and failure paths
- Application service requests, ownership filters, and database error handling
- Application state and statistics after successful and failed saves or deletions
- Validation boundaries, invalid form submissions, and normalized submission values
- Website normalization and helper logic
- Filtering and statistics utilities

These tests use mocked Supabase responses. They do not verify a live database's Row Level Security policies or a complete deployed authentication flow.

## Contributing

This project follows a lightweight PR workflow:

- Branches use focused prefixes such as `feature/`, `fix/`, `refactor/`, `test/`, and `docs/`
- Commits use conventional messages such as `feat:`, `fix:`, `refactor:`, `test:`, and `docs:`
- Pull requests should solve one clear problem and include verification notes

See `CONTRIBUTING.md` for the full workflow.

## License

MIT
