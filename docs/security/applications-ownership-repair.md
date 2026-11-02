# Applications ownership security repair

## Status and scope

**Production repair is recorded as version 20261102122254, name
repair_applications_ownership_20261102.** Read-only inspection on 2 November 2026
verified the recorded SQL and current ownership policies/effective client grants.
The user reports that authenticated JobTracker operations still work. No agent
functional production test or isolated database-suite result is claimed.

See [the authoritative deployed record and migration gate](../database-migrations.md).
The local security-patches file below is a different pre-deployment candidate.
Do not rerun it or the recorded repair on production. **Migration history is only
partially reconciled; automatic migration execution remains blocked.** The later
deployment instructions are historical preparation context, not an authorization
or a current rollout plan.

The original candidate baseline was main at 4d9064d14958549c7b8f9259bdff593e1a939da5.
The prior 1 November 2026 catalog inspection found four owner policies plus four
permissive allow-all policies, broad client grants, and no
supabase_migrations.schema_migrations table. No production SQL is run by this
implementation or its local quality checks. That earlier observation is historical:
the current history table contains the recorded production repair. Only authorized
read-only migration/catalog inspection was performed during repository reconciliation.

This repair changes security metadata on public.applications and its associated
identity sequence only. It does not change application records, columns,
constraints, sequence values, application architecture, or historical migrations.
The separate history/naming/schema-drift issues remain open.

## Safety review

Reviewed against PostgreSQL 17 and current Supabase documentation:

| Concern                      | Decision                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transaction owner            | Use psql -X -w --single-transaction --set=ON_ERROR_STOP=1 with the SQL transaction body. There are no embedded BEGIN/COMMIT statements that could defeat its wrapper. PostgreSQL documents rollback on any command error with this combination.                                                                                                     |
| Supabase apply-migration API | Its public endpoint documentation and client wrapper do not establish an explicit atomicity contract. Do not assume one. This patch's psql rollback probe does not validate that API. API deployment remains blocked until its own rollback and migration-recording behavior is demonstrated in an approved disposable project.                     |
| Lock                         | ACCESS EXCLUSIVE blocks reads, writes, and conflicting DDL until transaction end. Use a quiet deployment window. Do not terminate other sessions automatically.                                                                                                                                                                                     |
| Timeouts                     | lock_timeout=5s limits each lock wait; statement_timeout=30s limits each statement, not the entire script. PostgreSQL 17 transaction_timeout=60s bounds the transaction/session. All settings are local to the transaction.                                                                                                                         |
| Predicates                   | SELECT/DELETE check existing ownership; INSERT checks new ownership; UPDATE checks both. TO authenticated is paired with auth.uid() = user_id.                                                                                                                                                                                                      |
| Effective privileges         | Remove direct and PUBLIC table/sequence grants, retain authenticated CRUD and sequence USAGE, then inspect effective privileges. No schema-wide grants, role changes, CASCADE, or service-role client are introduced.                                                                                                                               |
| Identity                     | Require the reviewed identity-column/sequence association. Preserve USAGE for authenticated clients and prove generated-ID insertion through the real API. Do not call setval, restart the sequence, or inspect its current value.                                                                                                                  |
| Verification block           | Check exact policies and RLS; positive authenticated privileges individually; no anonymous access; no excessive table/sequence privileges, effective column REFERENCES, or column grant options, including inherited grants. Unexpected grants abort for investigation; no unfamiliar role is modified. A comma-separated privilege list means ANY. |
| Client privilege bypass      | Refuse a missing, privileged, or table-owner-equivalent anon/authenticated role. Do not use FORCE RLS as a substitute for ordinary restricted clients. Use a transaction-local pg_catalog search path for built-in SQL functions.                                                                                                                   |
| Unexpected state             | Missing expected policies, unexpected extra policies, ownership/identity drift, insufficient privileges, or failed checks abort the transaction. No automatic correction of unknown state.                                                                                                                                                          |

Sources:

- [psql transaction options](https://www.postgresql.org/docs/17/app-psql.html#APP-PSQL-OPTION-SINGLE-TRANSACTION)
- [PostgreSQL lock behavior](https://www.postgresql.org/docs/17/explicit-locking.html)
- [PostgreSQL timeout semantics](https://www.postgresql.org/docs/17/runtime-config-client.html)
- [ALTER POLICY](https://www.postgresql.org/docs/17/sql-alterpolicy.html)
- [Privileges and PUBLIC](https://www.postgresql.org/docs/17/sql-revoke.html)
- [Privilege inquiry functions](https://www.postgresql.org/docs/17/functions-info.html)
- [Identity columns](https://www.postgresql.org/docs/17/ddl-identity-columns.html)
- [Supabase migration API](https://supabase.com/docs/reference/api/v1-apply-a-migration)
- [Supabase migration history](https://supabase.com/docs/guides/deployment/database-migrations)

Syntax and documentation review are not PostgreSQL execution evidence. SQL
parsing, hosted permission behavior, lock timing, and rollback are unverified
until the isolated suite runs.

## Files

- supabase/security-patches/repair_applications_ownership.sql: permanent ownership repair, transaction body.
- supabase/security-patches/contain_applications_access.sql: temporary denial of client access, transaction body.
- supabase/security-patches/inspect_applications_security.sql: read-only catalog snapshot, no user/application records.
- tests/integration/fixtures/applications_legacy.sql: empty-project synthetic schema with the known insecure configuration.
- tests/integration/applicationsOwnership.test.js: real Auth/Data API authorization and psql transaction checks.
- tests/integration/environment.js and database.js: target/credential guards and the disposable-only psql executor.
- tests/integration/environment.offline.js: network-free guard regressions.
- tests/integration/http.js: bounded HTTP transport shared by Auth and Data API clients.
- vitest.integration.config.js: separate Node integration environment; no app env-file loading.

## Immediate containment if remediation is delayed

Containment and permanent remediation are different actions. Neither is
authorized for production by approval of local implementation.

A separately authorized operator can temporarily pause the JobTracker project
through the Supabase control plane. This deliberately interrupts Auth/Data API
availability; resuming before the repair restores the exposure. Hiding the
frontend or displaying a maintenance page does not stop direct API requests.

If separately approved, the containment SQL removes all effective client access
to this table and sequence. It is a temporary outage, not an ownership fix.
Its guard refuses to report success if inherited permissions still allow access.
Do not expand this into unrelated schema or shared-role changes.

No containment or project pause was executed by this agent. The user reports the
permanent repair has been deployed; it is independently present in migration history.

## Disposable integration environment

The user supplied dedicated test project hjgxjapcdxlimmoewmxj and created synthetic
users. No hosted execution evidence is available here. Do not use the production project,
another application's project, a production-data clone, or the shared demo user.
Do not create a test project without explicit authorization and any required
cost approval. Docker and new test frameworks are not required.

For a future approved run:

1. Provision a dedicated empty Supabase PostgreSQL 17 project.
2. Through its administrative control plane, create two confirmed synthetic
   accounts with distinct example.invalid emails. Do not send confirmation mail.
3. Keep Data API public-schema access enabled in that disposable project.
4. Provide an installed psql 17+ client and a trusted TLS root certificate.
   The direct project database endpoint must be reachable; pooler substitution
   is intentionally not supported by this narrow test executor.
5. Configure the environment variables below using only test credentials.
   The suite does not load .env.local or any app environment file.
6. Obtain explicit approval for that exact project reference before running.

Required variables:

```text
JOBTRACKER_TEST_PROJECT_REF=<approved disposable ref>
JOBTRACKER_TEST_DISPOSABLE=yes
JOBTRACKER_TEST_SUPABASE_URL=https://<approved disposable ref>.supabase.co
JOBTRACKER_TEST_PUBLIC_KEY=<test publishable key or matching legacy anon key>
JOBTRACKER_TEST_USER_A_EMAIL=<synthetic-a@example.invalid>
JOBTRACKER_TEST_USER_A_PASSWORD=<synthetic password>
JOBTRACKER_TEST_USER_B_EMAIL=<synthetic-b@example.invalid>
JOBTRACKER_TEST_USER_B_PASSWORD=<synthetic password>
JOBTRACKER_TEST_PGPASSFILE=<absolute path to test-only libpq password file>
JOBTRACKER_TEST_SSLROOTCERT=<absolute path to trusted root certificate>
```

The password file must match the test direct host, port 5432, database postgres,
and administrative user postgres. Restrict its local file permissions. Keep it
outside Git. No password/DSN is put in command arguments or logs.

Before collection, preflight validates the API target, public-key type, synthetic
identities, required passwords, absolute readable password/certificate files, and
an installed psql 17+ client using only psql --version. Setup repeats preflight
before constructing clients or making Auth/Data API/database requests. SQL calls
revalidate target and file paths. Local file checks do not prove credential
validity, certificate contents/trust, network reachability, or database version;
those still require the approved disposable run.

The executor constructs the direct hostname from the approved reference,
requires TLS verify-full, and discards inherited alternate targets, passwords,
and session options. Environment guards also block the production reference
and all currently known unrelated project references. These are accidental-use
guards, not a replacement for human approval or access control.

Administrative SQL is used only to create the synthetic schema, apply security
metadata, and inspect catalogs. Every application-record assertion uses an
ordinary publishable-key client signed in as synthetic A/B or signed out.
The test process has no service-role key, privileged data client, or admin Auth
SDK. Server-confirmed user identities are checked before negative tests.

## Commands and evidence

Offline safety checks need no database and make no network calls:

```sh
npm run test:security:offline
```

The hosted suite is a separate, explicitly armed operation:

```sh
npm run test:security:integration
```

Missing/unsafe local configuration or SQL prerequisites exit BLOCKED before
collection and hosted requests. This does not authenticate credentials or connect
to validate TLS during preflight. Do not run the hosted suite without approval
for that exact project reference.

The suite performs a single disposable-project lifecycle:

1. Complete local preflight, then authenticate synthetic users.
2. Create the legacy fixture in one transaction. It refuses an existing
   applications table; there is no reset, DROP TABLE, or replacement path.
3. Prove successful A/B CRUD before negative authorization assertions.
4. Show that the same cross-user read invariant used after repair fails on
   error-free legacy responses containing a known foreign synthetic row.
   Separately demonstrate anonymous exposure of that same known fixture.
5. Capture catalog state, execute the exact patch followed by an intentional
   exception in one psql transaction, require exit 3 and the unique probe marker,
   and compare catalog state and synthetic rows afterward. An earlier syntax
   error cannot count as a successful rollback probe.
6. Apply the exact candidate. Verify existing A/B records, columns, constraints,
   owner, and non-client ACLs are unchanged.
7. Verify own-user CRUD, unfiltered/guessed-ID reads, denied cross-user writes,
   forged-owner inserts, ownership reassignment, and anonymous CRUD.
   Forbidden INSERT/UPDATE requests omit RETURNING (.select()) so a restrictive
   SELECT policy cannot hide a permissive write check. Independent owner/other-user
   reads check stored state. Successful own-user CRUD still checks returned values.
8. Apply temporary containment in the disposable project, verify denial, and
   recover with the secure patch without restoring allow-all policies.
9. Clean up tracked unique synthetic markers, additionally scoped by ID when
   available, through legitimate A/B clients. Markers are tracked before writes
   in case a response is lost. Check for remaining visible records after deletion.
   Attempt all eligible fixtures even after an error and report aggregate cleanup
   failures separately from the original test failure. Do not delete users or
   automatically reset/delete the project.

Vitest runs sequentially with bail=1: a failed prerequisite/test stops dependent
tests while afterAll still attempts cleanup. Each Auth/Data API fetch has a
10-second abort deadline. Data API builders also receive the stage signal so SDK
retry delays respect cancellation. Setup requests share a 110-second deadline;
cleanup gets a fresh 60-second deadline. Their hooks are set to 120/70 seconds.
Synchronous psql can delay delivery of JavaScript timeout callbacks; its separate
server/process limits still apply. Cancellation is reported as AbortError to stop
SDK read retries. Cleanup has its own signal so a failed test cannot disable it.
No new test runner is introduced.

An aborted HTTP write may already have committed remotely. Cancellation cannot
undo it. SQL uses its existing server timeouts and bounded psql process; an
interrupted/unknown outcome needs inspection before retrying. A killed process,
failed secure recovery, exhausted cleanup budget, or failed setup may leave
synthetic records or the insecure legacy fixture. Keep the project dedicated and
quarantined for synthetic testing; obtain separate approval to recover/dispose of
it. Never reuse it for real data. Cleanup failure is not successful verification.

The operator must dispose of the test project through a separately approved
control-plane action. To repeat from an empty legacy schema, use a newly approved
empty project. This suite deliberately refuses destructive reinitialization.

The ordinary npm run test:run suite excludes tests/integration and runs the
product tests under src. No production Supabase singleton is imported by
the integration tests. No coverage percentage is a success criterion.

### Current verification status — 2 November 2026

- Database integration: NOT EXECUTED by this agent; dedicated project supplied, but no hosted-suite results are claimed.
- Candidate PostgreSQL execution/rollback proof: NOT EXECUTED by this agent. Production applied a different recorded script; that does not validate this candidate or its rollback probe.
- Hosted CI: not established by this work.
- Local verification used the already-installed Node 24.22.1 runtime explicitly.
- npm run lint: passed (exit 0).
- npm run typecheck: passed (exit 0). The existing tsconfig checks src; it does not type-check the JavaScript integration harness.
- npm run test:run -- --maxWorkers=2: 118 tests passed across 14 files (39.96 seconds), after fast-forwarding to main at 3d34fd4.
- npm run test:security:offline: 14 passed (exit 0), no hosted calls. Includes importing the actual integration configuration with missing password/certificate files and requiring rejection before collection.
- npm run build: passed (exit 0).
- npm run format:check: passed (exit 0).
- git diff --check: passed; new SQL/JS/docs files are checked separately because Git's ordinary diff omits untracked files.
- Earlier temporary offline Vitest smoke probe: an intentional 50ms timeout exited 1 as expected; the HTTP signal aborted, the dependent test was skipped, and afterAll executed. The probe used fake transport and no SQL or hosted requests; temporary probe files were removed. This was not rerun during final PR preparation.

During earlier amendment work, the first unit-suite attempt exited 1 before collecting any tests: Windows
denied an atomic rename in Vitest's transformed-module cache under the sandbox
temporary directory (EPERM). The retry used process-local TEMP/TMP/TMPDIR pointing
to .vite/local-verification-temp and passed. Final PR checks used the same process-local
workaround under .vite/final-pr-temp. No repository test/config changes,
dependency installs, cache deletion, or persistent machine configuration changes
were needed for that workaround. The failed attempt is not counted as a pass.
The ordinary unit files, lockfile, runtime declarations, and CI remain unchanged.

### Focused review amendments

The amendments remove RETURNING from forbidden INSERT/UPDATE probes, check
effective excess column privileges, move SQL prerequisites ahead of hosted
requests, and use Vitest bail/cancellation plus best-effort verified cleanup.
Redundant candidate queries in non-insert anonymous cases are removed; inline
cleanup is consolidated in afterAll so it cannot mask a test's original failure.
Containment/recovery failures preserve both errors. No unit files, historical migrations, application architecture,
dependencies, or production resources are changed. PostgreSQL execution remains
unverified; passing offline checks cannot establish RLS or rollback correctness.

## Deployment prerequisites and procedure

Production deployment is not authorized. Do not run production SQL, retrieve
production credentials, create production credentials, push, or merge as part
of local verification.

Before requesting deployment approval:

1. Complete isolated positive/negative behavior, record-preservation, containment,
   and intentional rollback checks. Record actual output, target, commit and SQL
   checksums without passwords, keys, tokens, or user data.
2. Review the complete diff and obtain code review.
3. Verify the exact production project independently, then obtain separate
   approval for production metadata preflight and the concrete deployment.
4. Capture catalog metadata, including policy expressions/roles, direct and
   inherited ACLs, column grants, owner/client-role flags, identity association,
   schema definitions, and current migration tracking.
5. Verify current provider backup/recovery availability; do not assume PITR.
   Keep metadata recovery records private and keep application data out of Git.
6. Stop on drift, unfamiliar policies/grantors, privilege dependencies, or
   unexpected identity/role configuration. Do not use CASCADE or terminate
   active sessions to force the patch through.

The documented reference executor is:

```sh
psql -X -w --single-transaction --set=ON_ERROR_STOP=1 \
  --file=supabase/security-patches/repair_applications_ownership.sql
```

This is an operator command, not an automated production script. Connection
configuration is supplied through an approved private libpq service/password
file and independently checked target. Never put a password in the command.
The integration executor refuses known production/unrelated references; its
accidental-use guards do not replace approval for the supplied test reference.

A successful psql exit proves only command completion; inspect metadata afterward.
A network timeout means unknown outcome: inspect before retrying.

### Truthful change and migration tracking

psql does NOT populate Supabase's migration history. Do not call a psql execution
a registered Supabase migration.

For this controlled hotfix, version-control the exact SQL outside the broken
historical runner. Record the actual execution method, commit, SHA-256, operator,
timestamp, outcome, and postflight evidence in the deployment record.

The actual repair is now registered in Supabase under 20261102122254. Its exact
statement and post-deployment catalog evidence are archived in docs/security/deployed.
Its historical transaction executor/atomicity has not been independently verified.
Do not substitute this candidate's psql procedure for that missing evidence.

Do not invent a server version or mark old scripts applied: their constraints
and other effects are absent. Do not create/update Supabase bookkeeping tables
by hand. Supabase API-generated versions, if that route is later validated,
must be read back and reconciled with the exact reviewed artifact.

General db push remains prohibited until a separate baseline/adoption change
reconciles the real schema, the actual repair, and uniquely versioned migration
files. Do not edit or replay historical migrations in this P0.

## Post-deployment verification

Current migration/catalog verification is recorded in the linked reconciliation
document. The following checklist is retained for reference; it is not a command
to redeploy the repair. Functional smoke testing is user-reported.

- Exactly four authenticated owner policies with exact commands and predicates.
- RLS enabled; ordinary client roles not privileged or owner-equivalent.
- Anonymous effective table/column/sequence access absent, including PUBLIC or
  membership-derived privileges.
- Authenticated CRUD and sequence USAGE present; excess privileges/grant options absent.
- Columns, constraints, owner, non-client ACLs, and identity association unchanged.
- Deployment artifact checksum matches the reviewed and isolated-tested SQL.
- Tracking/ledger describes what actually ran, without falsely applied history.

Metadata inspection must not read application records, auth users, or sequence
values. Functional production smoke tests require separately approved synthetic
accounts and records; never probe existing users' records.

## Secure recovery

A pre-commit failure rolls back the transaction and leaves the old configuration;
it is not resolution. Investigate promptly.

After commit, prefer a reviewed forward correction. If service cannot safely
continue, a separately approved operator can apply the containment transaction
body using the same atomic executor. Legitimate CRUD will stop. Preserve
administrative recovery access and records.

Recover from containment using a separately reviewed forward correction and
verification. Do not replay the archived production migration: it requires the
old eight-policy state. The local candidate is different and remains unverified
against PostgreSQL; it is not an automatically approved production recovery step.
Never automatically recreate allow-all policies, grant anonymous access, restore
excess privileges, reset production, or restore a whole database merely to undo
a policy error.

## PR scope and follow-up

See [the reconciliation document](../database-migrations.md#proposed-issue-and-pr)
for the PR scope and separate historical-baseline issue. The production repair
is already recorded; this PR preserves evidence and guarded verification tooling.
It does not deploy SQL or resolve the remaining historical baseline.
