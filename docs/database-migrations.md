# Database baseline, security repair and recovery

## Current hosted state

[Issue #140](https://github.com/simbongile-mkhotheli/JobTracker/issues/140)
records the baseline reconciliation for hosted project `urzvwixshavciyktjlhw`.
The [initial applications migration](../supabase/migrations/20261102175831_initial_applications.sql)
is the sole active migration and the sole entry in the hosted migration history.
The earlier repair `20261102122254` was retired from the applied history. Its
archived SQL and metadata preserve the record of that repair.

- Baseline version `20261102175831`
- SHA-256 `5cd3fe90953f411b57f45b152c1166a0618c24fb773dfe22146d369f09501bf4`
- The [deployed schema](supabase-schema.md) has four permanent ownership RLS
  policies. The temporary maintenance gate was removed after verification.
- All three Auth accounts were preserved, and the disposable test applications
  were removed.

The baseline creates the table on a fresh database. Local seeding is disabled
because the repository has no seed data. For future changes, review and test new
migrations locally before applying them to an approved hosted project. The
repository's quality workflow runs application checks only.

## Verification

The baseline passed local PostgreSQL 17 replay and checks for constraints,
effective permissions and owner-only CRUD. The hosted rebuild was verified with
separate ordinary authenticated sessions. Cross-user SELECT, INSERT, UPDATE,
DELETE and ownership reassignment were blocked. Final browser smoke tests passed
for demo login and CRUD after the gate was removed. The shared demo login uses
one Auth account, so its visitors share that account's applications.

ESLint, TypeScript and the Vite production build passed with a compatible
Node.js runtime. Vitest passed 118 tests across 14 files. The unit tests mock
Supabase responses. The hosted session and browser checks provide the live
security evidence.

## Historical rebuild and recovery record

The completed rebuild replaced only `public.applications`, using the approved
baseline in a scoped PostgreSQL transaction and preserved Supabase Auth. Before
execution, checks confirmed the target and backup fingerprints and verified the
TLS connection with `sslmode=verify-full` and the project CA. During maintenance, a temporary
restrictive policy limited application access to the private verification users
while the ownership policies continued to apply.

The schema change and migration-history reconciliation were separate steps.
After verification of the rebuilt schema, the baseline was recorded as applied
and the old repair entry was retired. The history changes recorded the completed
rebuild and preserved the archived repair as historical evidence.

Before the rebuild, separate private archives captured the applications schema,
rows and related objects, plus the migration-history evidence. A disposable
local restore verified archive integrity, rows, constraints, indexes, sequence
state, privileges and RLS. The local restore used UUID-only fixtures to satisfy
the Auth foreign key without copying Auth accounts. Backup data and connection
credentials belong outside Git.

For a future separately reviewed recovery:

- Reconfirm the target, archive hashes, dependencies and Auth owners. Rehearse
  the restore in an isolated local environment before touching hosted data.
- Use a scoped transaction with bounded lock and statement timeouts and stop on
  SQL errors. A failure before commit rolls back that transaction. If the
  connection drops around commit, inspect the actual schema and history before
  retrying.
- After a committed change, recovery requires a reviewed restore or fix. Use
  the existing hosted Auth accounts for foreign-key checks. Local Auth fixtures
  are for disposable restores only.
- Verify rows, grants, sequence state and owner access with ordinary users
  before reopening access. Keep schema restoration and migration-history
  reconciliation separate. Preserve owner-only RLS throughout recovery.

## Historical ownership repair

Four permissive PUBLIC allow-all policies once coexisted with owner policies on
`public.applications`. PostgreSQL combines permissive policies with OR, so the
allow-all policies defeated the ownership restrictions. Ordinary client roles
also held unnecessarily broad table and identity-sequence privileges.

Repair `20261102122254`, named `repair_applications_ownership_20261102`, removed
those four allow-all policies and retained four `authenticated` ownership
policies. Its catalog snapshot recorded that anonymous clients had no effective
table, column or sequence access. Authenticated clients retained CRUD and
sequence USAGE at that time. The current baseline uses identity-generated IDs
without granting direct sequence privileges to client roles.

On 2 November 2026, read-only queries retrieved the repair's migration history
and security catalog from the hosted project. The
[archived SQL](security/deployed/20261102122254_repair_applications_ownership_20261102.sql)
is the exact `supabase_migrations.schema_migrations.statements[1]` from that
record. It was recovered as UTF-8 hex and decoded without formatting. Its byte
length and MD5 matched the server values, and SHA-256 was calculated locally.

- Statements: **1**
- UTF-8 bytes: **5829**
- Server MD5: `502b72305a26e6ec30cce9f9ed28663f`
- SHA-256: `1d6f279002ca671774f2e9c30393206532e663f0a7692fc2c18a59d1b3f52acb`

The [archived metadata and catalog snapshot](security/deployed/20261102122254.metadata.json)
contain the supporting evidence. A scoped Git attribute protects the exact SQL
bytes from line-ending conversion. Keep the archive outside the active migration
directory and preserve it byte for byte.

## Retired migration files

The historical [schema migration](https://github.com/simbongile-mkhotheli/JobTracker/blob/c68e2b47f305c02763dd519c13eb9a9293f299ba/supabase/migrations/20260616_000001_jobtracker_schema.sql)
and [normalization migration](https://github.com/simbongile-mkhotheli/JobTracker/blob/c68e2b47f305c02763dd519c13eb9a9293f299ba/supabase/migrations/20260616_000002_normalize_applications_schema.sql)
are preserved in Git history. They share the version prefix `20260616`. The first
uses unquoted `logoUrl` and `dateApplied`, which PostgreSQL folds to lowercase,
while the second assumes quoted mixed-case names. The archived repair also
expects the old eight-policy state. Keep all three files retired. Replaying them
or marking them applied would misrepresent the current baseline.
