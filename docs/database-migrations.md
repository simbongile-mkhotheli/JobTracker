# Deployed ownership repair and migration status

**PARTIALLY RECONCILED.** The production ownership repair is recorded correctly;
historical migration baseline work remains separate in
[issue #140](https://github.com/simbongile-mkhotheli/JobTracker/issues/140).
This record documents the completed repair; it does not authorize further deployment.

## Vulnerability and completed repair

Four permissive PUBLIC allow-all policies coexisted with owner policies on
`public.applications`. PostgreSQL combines permissive policies with OR, so the
allow-all policies defeated the ownership restrictions. Ordinary client roles
also held unnecessarily broad table and identity-sequence privileges.

Production migration `20261102122254`, named
`repair_applications_ownership_20261102`, removed those four allow-all policies
and retained four policies for `authenticated` using `auth.uid() = user_id`:

| Operation | USING: existing ownership | WITH CHECK: resulting ownership |
| --------- | ------------------------- | ------------------------------- |
| SELECT    | required                  | not applicable                  |
| INSERT    | not applicable            | required                        |
| UPDATE    | required                  | required                        |
| DELETE    | required                  | not applicable                  |

The recorded catalog snapshot confirms RLS is enabled, anonymous effective
table/column/sequence access is absent, and authenticated clients retain
SELECT/INSERT/UPDATE/DELETE plus sequence USAGE without tested excess privileges
or grant options. Both client roles lack superuser, BYPASSRLS and inherited
table-owner privileges.

## Exact production record and verification

On 2 November 2026, authorized read-only queries retrieved migration history and
security catalogs from project `urzvwixshavciyktjlhw`. No application records or
auth user data were read. The observed history contained this single migration.

The [SQL archive](security/deployed/20261102122254_repair_applications_ownership_20261102.sql)
is the exact `supabase_migrations.schema_migrations.statements[1]`, recovered as
UTF-8 hex and decoded without formatting. Its byte length and MD5 matched the
server values; SHA-256 was calculated locally:

- Statements: **1**
- UTF-8 bytes: **5829**
- Server MD5: `502b72305a26e6ec30cce9f9ed28663f`
- SHA-256: `1d6f279002ca671774f2e9c30393206532e663f0a7692fc2c18a59d1b3f52acb`

[Migration metadata and the catalog snapshot](security/deployed/20261102122254.metadata.json)
preserve the supporting evidence. The archive retains its leading/trailing
newlines; a scoped Git attribute prevents line-ending conversion. Do not format
or edit it. It is evidence outside the active migration directory, not a pending
migration.

The user reports that authenticated JobTracker operations work. Catalog checks
confirm configuration, but do not independently prove every denied operation,
historical transaction atomicity or pre/post record preservation. Existing
application unit tests use mocked Supabase responses and do not verify live RLS.

## Why historical migrations must not be replayed

The unchanged `20260616_000001_jobtracker_schema.sql` and
`20260616_000002_normalize_applications_schema.sql` share version prefix
`20260616`. The first uses unquoted logoUrl/dateApplied, which PostgreSQL folds
to lowercase; the second assumes quoted mixed-case identifiers.

Production does not include every schema change described by those scripts;
the [deployed schema reference](supabase-schema.md) records the differences.
The security repair did not apply the missing schema changes. Do not mark the
historical scripts applied based only on matching names.

The recorded repair requires the old eight-policy state. Replaying it against
the repaired table would fail. Do not reapply it, rename historical migrations
to make them pending, or use db push, db reset or migration repair to force the
histories to agree. The repository's quality workflow executes no migrations;
this warning does not technically prevent someone from running CLI commands.

Issue #140 must establish a truthful baseline/adoption strategy that preserves
the recorded repair and handles existing production and fresh-database creation
without blindly replaying it. This documentation does not establish a baseline
or change constraints, history flags or application records. Future database changes require a
separate reviewed plan and approval.
