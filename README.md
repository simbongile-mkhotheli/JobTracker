# JobTracker

A clean, maintainable job application tracking dashboard that demonstrates practical React engineering and real-world frontend architecture patterns.

**[Live Demo](https://job-tracker-seven-self.vercel.app)** | **[Getting Started](#getting-started)**

## Why This Project?

JobTracker showcases:

- **Clean architecture** with clear separation of concerns across components, hooks, services, utilities, and constants
- **Scalable patterns** using custom hooks, service abstraction, reusable UI primitives, and shared validation logic
- **Professional workflows** with structured Git conventions, CI, pre-commit hooks, and incremental development
- **Practical engineering** focused on maintainability, UX quality, and production-ready frontend patterns

## Tech Stack

**Framework**: React | **Build Tool**: Vite | **Styling**: Tailwind CSS | **Icons**: Lucide React | **Persistence**: Supabase

**Testing**: Vitest | React Testing Library
**Quality Tools**: ESLint | Husky | lint-staged | GitHub Actions

## Getting Started

```bash
# Clone and setup
git clone https://github.com/simbongile-mkhotheli/JobTracker.git
cd JobTracker
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see it in action.

## Environment Variables

Create a `.env.local` file in the root:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Architecture

```txt
src/
├── App.jsx              # Root component
├── main.jsx             # Entry point
├── components/          # Reusable UI components
│   ├── ui/              # Shared UI primitives
│   └── form/            # Reusable form fields
├── pages/               # Page-level components
├── hooks/               # Custom React hooks
├── services/            # Supabase data access
├── constants/           # Shared configuration and validation rules
├── utils/               # Helper functions and business logic
├── layouts/             # Layout wrappers
├── data/                # Seed data
├── lib/                 # Supabase client setup
└── test/                # Test setup
```

**Key patterns**:

- Custom hooks (`useApplications`) encapsulate state management
- Service layer handles backend persistence
- Components stay focused on rendering and interaction
- Constants centralize shared values and validation rules
- Utilities isolate reusable business logic
- Tests focus on critical behavior, not implementation details

## Testing

Run tests:

```bash
npm run test
```

Current coverage focuses on:

- Application service behavior
- Website normalization
- Application validation

## Contributing

We follow structured Git workflows focused on maintainability:

Branches: feature/_, fix/_, refactor/_, chore/_ — descriptive and focused
Commits: Conventional format (feat:, fix:, refactor:, chore:, test:, docs:)
PRs: Single concern, clear summary, notes, and linked issues

See CONTRIBUTING.md for detailed guidelines.

MIT License

## Database Schema

The application's database contract is documented in:

- `docs/supabase-schema.md`
- `supabase/migrations/20260616_000001_jobtracker_schema.sql`

The `applications` table is protected with Row Level Security so users can only access their own records.
