# JobTracker

A clean, maintainable job application tracking dashboard that demonstrates practical React engineering and real-world frontend architecture patterns.

**[Live Demo](https://job-tracker-seven-self.vercel.app)** | **[Getting Started](#getting-started)**

## Why This Project?

JobTracker showcases:

- **Clean architecture** with clear separation of concerns (components, hooks, services)
- **Scalable patterns** using custom hooks, service layer abstraction, and reusable UI components
- **Professional workflows** with structured Git conventions and incremental development
- **Practical engineering** prioritizing maintainability and real-world best practices over unnecessary complexity

## Core Features

- ✅ Full CRUD workflows for job applications
- ✅ Modal-based application management
- ✅ Company metadata support via website detection
- ✅ Automatic favicon/logo previews
- ✅ Search and status filtering
- ✅ Persistent local storage state
- ✅ Responsive dashboard UI
- ✅ Reusable component architecture

## Tech Stack

**Framework**: React | **Build Tool**: Vite | **Styling**: Tailwind CSS | **Icons**: Lucide React | **Persistence**: Local Storage API

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

## Architecture

```
src/
├── App.jsx              # Root component
├── main.jsx             # Entry point
├── components/          # Reusable UI components
├── pages/               # Page-level components
├── hooks/               # Custom React hooks (state logic)
├── services/            # Business logic & persistence
├── constants/           # Shared configuration
├── utils/               # Helper functions
├── layouts/             # Layout wrappers
├── data/                # Seed data
└── index.css            # Global styles
```

**Key patterns**:

- Custom hooks (`useApplications`) encapsulate state management
- Service layer handles all data persistence
- Components stay focused on rendering and user interaction
- Constants centralized for easy maintenance

## Contributing

We follow structured Git workflows focused on maintainability:

- **Branches**: `feature/*`, `fix/*`, `refactor/*` — descriptive and focused
- **Commits**: Conventional format (`feat:`, `fix:`, `refactor:`, `chore:`)
- **PRs**: Single concern, clear summary, linked issues

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

MIT License
