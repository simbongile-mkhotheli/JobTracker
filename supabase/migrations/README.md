# Migration execution is blocked

Do not run this directory against any database. The two historical SQL files
share version `20260616`, are absent from observed production history, and do not
faithfully represent the deployed schema. They remain untouched as historical
source, not an approved installation or upgrade path.

The production repair `20261102122254` is already applied. Its exact recorded SQL
is archived outside this active directory to avoid a duplicate pending migration.

Read [the reconciliation status and deployment gate](../../docs/database-migrations.md)
before any migration command. A matching filename/version alone does not prove
that a migration's schema effects exist.
