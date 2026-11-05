# JobTracker

JobTracker is a responsive dashboard for tracking job applications, built with **React, TypeScript, Vite, Tailwind CSS, and Supabase**.

[**Live Application**](https://job-tracker-seven-self.vercel.app/) · [**Source Code**](https://github.com/simbongile-mkhotheli/JobTracker) · [**Getting Started**](#getting-started)

---

## Overview

Managing job applications can become difficult when company details, application dates, interview information, and application statuses are spread across different places.

JobTracker brings application records and progress summaries together in one dashboard. The codebase shows how the UI, application state, and database access fit together in a tested React app.

## Features

### Application Management

- Add, edit, and delete job applications.
- Record company names, job roles, application dates, websites, and notes.
- Track applications using **Applied**, **Interview**, **Offer**, and **Rejected** statuses.
- Search applications by company or job role.
- Filter applications by status.
- View and update application notes.

### Dashboard

- View total applications, interviews, offers, and rejections.
- Browse applications in a responsive layout.
- Receive feedback for loading, empty, success, validation, and error states.

### Authentication and Data Privacy

- Sign up and sign in with email and password through Supabase Auth.
- Use **Try Demo** to sign in to a shared demo account. Visitors using that account see the same demo records.
- Access the dashboard through protected routes.

## Tech Stack

| Category             | Technologies                        |
| -------------------- | ----------------------------------- |
| Frontend             | React, TypeScript, JavaScript, Vite |
| Styling              | Tailwind CSS                        |
| Routing              | React Router                        |
| Authentication       | Supabase Auth                       |
| Database             | Supabase PostgreSQL                 |
| Testing              | Vitest, React Testing Library       |
| Code Quality         | ESLint, Prettier, TypeScript        |
| Development Workflow | Git, GitHub, Husky, lint-staged     |
| CI                   | GitHub Actions                      |
| Deployment           | Vercel                              |

## Engineering Approach

JobTracker separates interface components, application state, and database operations to make the code easier to understand, test, and maintain.

### Application Architecture

```text
React Components
       |
       v
Custom Hooks
       |
       v
Service Layer
       |
       v
Supabase Client
       |
       v
PostgreSQL + Row Level Security
```

**React components** handle presentation and user interactions.

**Custom hooks**, including `useApplications`, coordinate application state, filtering, statistics, and CRUD operations.

**The service layer** handles Supabase requests and maps database fields to application-facing models.

**Supabase Authentication** identifies the signed-in user.

**Database policies** enforce record ownership independently of frontend checks.

## Database Security

JobTracker uses PostgreSQL Row Level Security to protect the `applications` table.

Four ownership policies control access:

- **SELECT:** Authenticated users can read their own applications.
- **INSERT:** Authenticated users can create records belonging to themselves.
- **UPDATE:** Authenticated users can modify their own records without transferring ownership.
- **DELETE:** Authenticated users can delete their own applications.

The database also enforces schema constraints and relationships between application records and authenticated users.

### Database Baseline

The hosted rebuild and migration reconciliation are complete. The
[initial applications migration](supabase/migrations/20261102175831_initial_applications.sql)
is the sole active migration and is recorded as applied on the hosted project.
Local database seeding is disabled.

Future schema changes should be tested in an isolated environment and reviewed before being applied to a hosted database.

For technical details, see:

- [Database Schema](docs/supabase-schema.md)
- [Migration and Recovery Documentation](docs/database-migrations.md)

## Testing and Code Quality

Testing and automated checks help reduce regressions and make changes easier to verify.

### Automated Testing

The test suite covers important application behaviours, including:

- Authentication session loading and state changes.
- Login and signup success and failure scenarios.
- Application creation, updates, deletion, and error handling.
- Form validation and invalid input.
- Application ownership filters in the service layer.
- Dashboard state and statistics.
- Search, filtering, and utility functions.

Tests focus on observable behaviour, meaningful assertions, and important positive and negative scenarios.

The Vitest suite uses mocked Supabase responses to check application behaviour. Live RLS verification is a separate check against the hosted database.

### Database Security Verification

Two ordinary authenticated test accounts verified owner access and denial of cross-user reads, inserts, updates, deletes, and ownership transfers. Final browser checks covered demo login and application create, edit, and delete workflows. See the [verification record](docs/database-migrations.md#verification).

### Quality Checks

After completing [setup](#getting-started), run the checks relevant to your change:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run format:check
```

| Command                | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `npm run lint`         | Detect code quality and linting issues          |
| `npm run typecheck`    | Check TypeScript types without generating files |
| `npm run test:run`     | Execute automated tests once                    |
| `npm run build`        | Verify the production build                     |
| `npm run format:check` | Check formatting consistency                    |

The production build and TypeScript checks are separate because the Vite build does not replace the TypeScript compiler check.

### Continuous Integration

The repository contains a GitHub Actions workflow configured to run linting, type checking, tests, and the production build for pull requests targeting `main` and pushes to `main`.

The [workflow](.github/workflows/ci.yml) reads the Node.js version from the Volta pin in [`package.json`](package.json). An account billing restriction has prevented GitHub Actions runs from starting. Report local results and hosted CI results separately.

## Getting Started

### Prerequisites

Before running the project locally, install:

- Node.js 24.x with npm. Use the version pinned in [`package.json`](package.json) to match CI. Volta selects that version automatically when installed.
- Git.
- A code editor.
- Access to a Supabase project.

### 1. Clone the Repository

```bash
git clone https://github.com/simbongile-mkhotheli/JobTracker.git
cd JobTracker
```

### 2. Install Dependencies

```bash
npm ci
```

This installs dependencies using the versions recorded in `package-lock.json`.

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-public-key
```

Use your Supabase project URL and public client key. The URL should be the project root, such as `https://your-project-id.supabase.co`.

Never place service-role keys, database passwords, or other private credentials in frontend environment variables.

A new Supabase project also needs the reviewed application database schema before database features can work.

See the [database migration documentation](docs/database-migrations.md) before provisioning a new environment.

Do not reset or modify an existing hosted database without reviewing the impact.

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Restart the development server after changing environment variables.

## Project Structure

```text
src/
├── components/     # Feature components and reusable UI
├── contexts/       # Authentication context
├── hooks/          # Application state and behaviour
├── layouts/        # Shared page layouts
├── lib/            # Supabase client setup
├── pages/          # Dashboard and authentication pages
├── services/       # Database operations and data mapping
├── types/          # Shared TypeScript types
├── utils/          # Validation and helper functions
└── test/           # Test setup

supabase/
├── config.toml     # Supabase CLI configuration
└── migrations/     # Version-controlled database baseline

docs/               # Database and project documentation
.github/workflows/  # GitHub Actions workflow
```

## Development Workflow

JobTracker follows a lightweight GitHub workflow:

1. Identify a problem or improvement and define its scope.
2. Create a focused branch.
3. Implement the change using existing project patterns.
4. Add or update relevant tests when behaviour changes.
5. Run local quality checks.
6. Open a pull request explaining the change and its verification.
7. Review and merge the change.

Pull requests should focus on one problem or improvement and avoid unrelated changes.

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming conventions, commit guidelines, testing expectations, and contribution instructions.

## Project Status

JobTracker is an active learning and portfolio project.

## License

Distributed under the [MIT License](LICENSE).
