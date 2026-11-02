# Database migration reconciliation

Status on 2 November 2026: **PARTIALLY RECONCILED — migration execution blocked.**

Production project: `urzvwixshavciyktjlhw`. Only read-only history/catalog queries
were used for this reconciliation. No records, policies, grants or migration
history were changed. Work belongs to `fix-applications-ownership-rls`.

## What production records

The complete observed migration history contains one record:

| Version        | Name                                   | Statements |
| -------------- | -------------------------------------- | ---------- |
| 20261102122254 | repair_applications_ownership_20261102 | 1          |

The [exact SQL](security/deployed/20261102122254_repair_applications_ownership_20261102.sql)
was recovered from `supabase_migrations.schema_migrations.statements[1]` as UTF-8
hex, decoded without formatting, and verified against the server byte length and
MD5. Leading/trailing newlines are preserved. The scoped Git attribute disables
line-ending conversion for this evidence file. Do not format or edit it.

- UTF-8 bytes: **5829**
- Server MD5: `502b72305a26e6ec30cce9f9ed28663f`
- SHA-256: `1d6f279002ca671774f2e9c30393206532e663f0a7692fc2c18a59d1b3f52acb`

[Recorded metadata and catalog snapshot](security/deployed/20261102122254.metadata.json)
contain no application records or auth user data. The version is the actual
recorded identifier; it is not evidence of a separately verified execution time,
operator, deployed Git commit, or transaction wrapper. Those details were not supplied.

## Verified resulting security

RLS is enabled; owner is postgres; FORCE RLS is false. Exactly four PERMISSIVE
policies target authenticated, with `auth.uid() = user_id`:

| Operation | Existing rows: USING | New values: WITH CHECK |
| --------- | -------------------- | ---------------------- |
| SELECT    | ownership            | none                   |
| INSERT    | none                 | ownership              |
| UPDATE    | ownership            | ownership              |
| DELETE    | ownership            | none                   |

The four PUBLIC allow-all policies are absent. Effective anonymous table, column
and sequence privileges are absent. Authenticated has SELECT/INSERT/UPDATE/DELETE
and sequence USAGE, with no excess table/column/sequence privileges or tested grant
options. Both ordinary client roles lack superuser, BYPASSRLS and inherited table
owner privileges. This corrects permissive policies combining with OR to defeat
ownership, plus excessively broad client grants.

The user reports a successful manual authenticated application smoke test.
This agent verified catalogs, not functional access through synthetic accounts.
The isolated legacy/ownership/rollback suite has not been run in this task and no
results were supplied. Current correct metadata does not retrospectively prove
deployment atomicity or pre/post record preservation.

## Deployed SQL versus local candidate

Keep `supabase/security-patches/repair_applications_ownership.sql` unchanged. It is
the earlier candidate used by the disposable suite, not the deployed artifact.
Its tests must not be presented as evidence for the different archived script.

| Concern              | Recorded production SQL                                                                                            | Local candidate                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Initial RLS          | Requires already enabled                                                                                           | Enables RLS                                                                                                                |
| Baseline             | Requires eight policies and matches allow-all/owner names, roles and predicates                                    | Checks PG17, current table owner, identity column/sequence and ordinary role privilege flags                               |
| Lock order           | Preflight before ACCESS EXCLUSIVE lock                                                                             | Lock before preflight                                                                                                      |
| Policy removal       | DROP POLICY, requires known names                                                                                  | DROP POLICY IF EXISTS; final checks reject extras                                                                          |
| Timeouts/search path | Local 5s lock and 30s statement timeouts; no explicit search path                                                  | Also 60s transaction timeout and pg_catalog search path                                                                    |
| Mutations            | Remove allow-all policies, scope owner policies, narrow table/sequence grants                                      | Same intended security mutations                                                                                           |
| Postflight           | Exact four matching owner policies, anonymous denial, CRUD/USAGE individually, excess table/column/sequence checks | Also schema USAGE, table/sequence grant options and explicit RLS-enabled checks; checks unused policy expressions are NULL |

The recorded script has effective column checks too. It does not include the
candidate's table-level grant-option and sequence grant-option assertions, though
the new read-only catalog query confirms these are absent now. Do not silently
replace either script or rerun the candidate to make production match it.
The recorded script expects the old eight-policy state and is deliberately not
replayable on the already-repaired table. Its preflight checks precede the lock;
do not claim the candidate's lock ordering/timeout properties were deployed.

## Why the historical files are not a baseline

Both `20260616_000001_jobtracker_schema.sql` and
`20260616_000002_normalize_applications_schema.sql` use Supabase's same version
prefix `20260616`. Unquoted logoUrl/dateApplied in the first fold to lowercase;
the second tries to rename quoted mixed-case identifiers. A fresh replay is not
an approved, reproducible installation.

Current catalog evidence also differs from those files:

- Only primary-key and user foreign-key constraints exist: the four historical
  status/company/role/notes checks are absent.
- Only the primary-key index exists: user_id and created_at indexes are absent.
- user_id remains nullable; historical creation says NOT NULL.
- id is GENERATED ALWAYS, while historical creation and the synthetic fixture
  use BY DEFAULT. The security repair contains no identity-mode change.
- Current columns use logo_url/date_applied; this does not prove the historical
  quoted renames ever ran. Historical owner policies target PUBLIC; current ones
  target authenticated.

Do not mark these scripts applied, rename them to new versions, add their missing
constraints, change existing records, or replay CREATE TABLE to silence history
differences. Preserve the real recorded security version.

## Chosen repository-only strategy and remaining blocker

Archive the deployed statement as immutable evidence outside `supabase/migrations`.
Do not add it as an active migration yet: the preceding baseline is invalid and
the exact deployed SQL expects pre-repair policies. No fake no-op migration or
second repair version is introduced. Leave the historical files untouched and
put an explicit stop notice beside them and in the repository README.

Full reconciliation needs a separately reviewed baseline/adoption design that
handles both existing production history and empty-database creation. It must
inventory the actual application schema without user records, decide how to
retire the historical files, and prove a clean replay in an approved disposable
environment. A post-repair snapshot already includes secure policies; appending
the old eight-policy repair to it would fail. Baseline design and history adoption
must therefore be solved together, not by changing timestamps or applied flags.
Any required database/history changes need separate approval.

## Deployment gate

There is no new automatic migration runner or CI deployment. This is a documented
stop gate, not a technical lock: historical SQL files are still discoverable by
CLI tools. Accidental replay is not mechanically impossible. Do not bypass it.

Before any future deployment:

1. Confirm the target and approvals; inspect the whole branch diff, migration
   filenames and version uniqueness. Check that none duplicates 20261102122254.
2. With authorized read-only access, compare all remote version/name/statement
   records with local artifacts and schema metadata. When already installed,
   consult CLI help for `supabase migration list` and select the explicit target;
   list is informational, not permission to repair its differences. No credentials
   belong in command arguments or Git. History presence is not a schema diff.
3. Stop on missing local versions, unexplained remote versions, duplicate prefixes,
   mismatched SQL or missing baseline effects. Do not mark versions applied or
   reverted just to make the lists agree.
4. After baseline/adoption is separately reconciled and disposable replay passes,
   obtain approval for a concrete plan. Only then use a supported `db push --dry-run`
   to inspect pending filenames (it contacts the database and is not a SQL
   correctness test). Require that only intended new migrations are pending;
   the recorded repair and historical scripts must not appear. Actual push needs
   separate deployment approval. These commands were not run here.

For now do not use db push (including dry-run), migration up, db reset, migration
repair, migration squash, or automatic db pull/history updates. migration new may
only create a future local file in a separately approved change; it does not
solve the current baseline. Never reset production. Use the independent guarded
disposable suite for candidate investigation only, with explicit SQL approval.

References: [Supabase migration history](https://supabase.com/docs/guides/deployment/database-migrations),
[Supabase CLI reference](https://supabase.com/docs/reference/cli/supabase-migration-list).

## Local verification of this reconciliation

Final PR checks were rerun with installed Node 24.22.1 tooling on 2 November 2026,
after fast-forwarding fix-applications-ownership-rls to origin/main at 3d34fd4
(fix: require explicit demo login, PR #139). That upstream commit is not part of
the security PR diff. Existing uncommitted work was retained without conflicts.

| Check                                               | Actual result                                           |
| --------------------------------------------------- | ------------------------------------------------------- |
| npm run lint                                        | Exit 0                                                  |
| npm run typecheck                                   | Exit 0; existing src scope                              |
| npm run test:run -- --maxWorkers=2                  | 118 passed, 14 files, 39.96s                            |
| npm run test:security:offline                       | 14 passed; no hosted requests                           |
| npm run build                                       | Exit 0                                                  |
| npm run format:check                                | Exit 0; changed documentation rechecked afterward       |
| git diff --check and separate untracked-file checks | No whitespace errors                                    |
| Archived SQL integrity                              | 5829 bytes and MD5 match server; SHA-256 recorded above |

Unit tests used process-local TEMP/TMP/TMPDIR under .vite/final-pr-temp
to avoid the previously observed Windows sandbox cache-rename issue. No unit
files or configuration were changed for this workaround. Temporary files were
removed after verification. No dependency installation or persistent machine
configuration change was required. No database integration test, migration
command, production write or real-user record query was executed.

## Proposed issue and PR

Issue: Reconcile the JobTracker database baseline without replaying the deployed
ownership repair. Acceptance: verified schema-only baseline, truthful history
mapping preserving 20261102122254, retired duplicate-prefix files, approved empty
replay and a deployment preview containing only intended future migrations.

PR: Preserve the deployed ownership repair and add guarded verification.
Archive the exact recorded SQL and catalog evidence, distinguish the local
candidate, and include the guarded disposable ownership suite, synthetic legacy
fixture, offline safeguards, and candidate/containment/inspection SQL. Document
the remaining baseline/adoption gate without adding active migrations or an
automatic deployment step. See the local verification record above. This PR
does not deploy SQL or claim fresh-database reproducibility or executed hosted
integration coverage.
