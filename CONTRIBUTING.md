# Contributing to JobTracker

Thank you for your interest in contributing to JobTracker.

JobTracker is a React and Supabase application for tracking job applications. The project focuses on building useful features while practising clean code, testing, accessibility, security, and collaborative development.

Contributions that improve functionality, user experience, documentation, or code quality are welcome.

## Getting Started

Follow the [README setup steps](README.md#getting-started) to install dependencies with the Node.js version pinned in `package.json` and configure a development Supabase project for app testing.

## Development Workflow

### 1. Start with an Issue

Before making a significant change:

- Check whether a related issue already exists.
- Create an issue if needed.
- Explain the problem or improvement.
- Define what a successful result looks like.
- Keep the scope focused.

Use appropriate labels such as `bug`, `feature`, `enhancement`, `documentation`, or `refactor` where available.

Small documentation corrections may not need a separate issue.

For bugs, include reproduction steps, expected and actual results, and the relevant environment. Use the [feature request](.github/ISSUE_TEMPLATE/feature_request.md) or [refactor](.github/ISSUE_TEMPLATE/refactor.md) template for proposed improvements.

### 2. Create a Branch

Create a focused branch from the appropriate updated base branch.

Use descriptive names such as:

```text
feature/application-search
fix/auth-session-loading
refactor/application-service
test/form-validation
docs/update-readme
chore/update-tooling
```

Avoid making unrelated changes in the same branch.

### 3. Implement the Change

Follow these principles:

- Prefer simple, readable solutions.
- Keep components focused on a clear responsibility.
- Reuse existing components and utilities where appropriate.
- Avoid unnecessary abstractions and dependencies.
- Handle loading, empty, success, and error states.
- Consider accessibility, responsiveness, and security.
- Follow the existing project structure and naming conventions.

**Keep it simple (KISS)** and avoid building features before they are needed (YAGNI).

### 4. Test Your Changes

Write or update tests when changing behaviour.

Tests should:

- Verify observable behaviour rather than implementation details.
- Focus on one clear behaviour per test.
- Cover important success and failure scenarios.
- Use meaningful assertions.
- Avoid unnecessary mocking and brittle assumptions.

For bug fixes, add a regression test when practical.

Do not add tests merely to increase the test count. Focus on meaningful coverage.

### 5. Run Quality Checks

Run the checks relevant to your change before opening a pull request. For a documentation edit, start with `npm run format:check` and verify the links and commands you changed.

For application changes, run:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run format:check
```

These commands check lint rules, TypeScript errors, automated tests, the production build, and formatting.

The [CI workflow](.github/workflows/ci.yml) uses the same Node.js pin and is configured to run linting, type checking, tests, and the production build for pull requests targeting `main`. Record hosted check results separately from local checks.

If a check fails, investigate the cause instead of disabling the check or weakening tests to make them pass.

## Database and Security Guidelines

JobTracker uses Supabase Authentication and PostgreSQL Row Level Security (RLS) to protect application records.

When changing database-related functionality:

- Preserve user ownership restrictions.
- Never rely on frontend checks alone for data authorization.
- Use reviewed migration files for schema changes.
- Test schema changes in a disposable environment first.
- Verify both allowed and denied access scenarios.
- Do not reset or modify the hosted production database without explicit approval.

The approved schema baseline and migration history are documented in:

- [Database Schema](docs/supabase-schema.md)
- [Database Migrations](docs/database-migrations.md)

Automated tests using mocked Supabase responses do not replace actual RLS verification.

**Never commit passwords, database backups, private keys, service-role keys, or local environment files.**

## Commit Messages

Use clear, focused commit messages following a simple Conventional Commits style.

Examples:

```text
feat: add application search
fix: preserve form values after failed save
refactor: simplify application service mapping
test: cover invalid form submissions
docs: improve setup instructions
chore: update development tooling
```

Avoid vague messages such as:

```text
fix stuff
final update
more changes
```

A good commit message explains what changed.

## Pull Request Guidelines

Keep each pull request focused on one problem or improvement.

A pull request should explain:

- What changed.
- Why the change was needed.
- How it was tested.
- Any important limitations or trade-offs.
- Which issue it addresses.

Use the [pull request template](.github/pull_request_template.md). Replace `<issue-number>` with the actual issue number when linking work. Use `Closes #<issue-number>` only when the PR fully resolves that issue.

Include screenshots when a change affects the interface.

## UI and Accessibility

When working on the interface:

- Maintain consistent layouts, spacing, and typography.
- Make interactive elements accessible by keyboard.
- Use semantic HTML and meaningful labels.
- Provide useful feedback for user actions.
- Check mobile and desktop layouts.
- Avoid unnecessary visual complexity.

Prioritize usability over decoration.

## Before Submitting

Confirm that:

- The change solves the intended problem.
- No unrelated files were modified.
- Relevant tests pass.
- Existing functionality still works.
- No sensitive information is included.
- Documentation is updated when necessary.
- The pull request clearly explains the change.

Review your own diff before requesting a review.

## Project Principles

JobTracker follows a few practical engineering principles:

**Clarity over cleverness.** Write code that another developer can understand.

**Simplicity over unnecessary complexity.** Introduce abstractions when they solve a real problem.

**Behaviour over implementation.** Test what the application should do.

**Security by design.** Protect user data at the database level.

**Small, focused improvements.** Make changes that are easier to review, test, and maintain.

The goal is not to create the most complicated solution. It is to build a reliable application while improving our engineering practices.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
