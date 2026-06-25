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

| Area | Tools |
| --- | --- |
| Frontend | React, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Backend services | Supabase Auth, Supabase Database |
| Testing | Vitest, React Testing Library |
| Quality | ESLint, Husky, lint-staged, GitHub Actions |
| Icons | Lucide React |

## Getting Started

```bash
git clone https://github.com/simbongile-mkhotheli/JobTracker.git
cd JobTracker
npm install
npm run dev
```

Visit `http://localhost:5173` after the dev server starts.

## Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

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
- Supabase migrations document the database contract and RLS ownership rules.
- Components are kept mostly presentational, with data access pushed into hooks and services.

## Database Schema

The application database contract is documented in:

- `docs/supabase-schema.md`
- `supabase/migrations/20260616_000001_jobtracker_schema.sql`
- `supabase/migrations/20260616_000002_normalize_applications_schema.sql`

The `applications` table uses Row Level Security policies so authenticated users can only read and mutate their own records.

## Quality Checks

Run the main local checks before opening a PR:

```bash
npm test -- --run
npm run lint
npm run build
```

Current automated coverage focuses on:

- Application service behavior
- Application validation
- Website normalization and helper logic
- Filtering and statistics utilities

## Contributing

This project follows a lightweight PR workflow:

- Branches use focused prefixes such as `feature/`, `fix/`, `refactor/`, `test/`, and `docs/`
- Commits use conventional messages such as `feat:`, `fix:`, `refactor:`, `test:`, and `docs:`
- Pull requests should solve one clear problem and include verification notes

See `CONTRIBUTING.md` for the full workflow.

## License

MIT
