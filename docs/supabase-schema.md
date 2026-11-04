# JobTracker Supabase Schema

This describes the deployed schema as recorded in the
[2 November 2026 catalog snapshot](security/deployed/20261102122254.metadata.json).
It is not a fresh database inspection or a replayable migration baseline.

## Table: applications

### Columns

| Column       | Type        | Deployed constraints                      | Notes                          |
| ------------ | ----------- | ----------------------------------------- | ------------------------------ |
| id           | bigint      | primary key, GENERATED ALWAYS AS IDENTITY | Application identifier         |
| created_at   | timestamptz | not null                                  | Record creation timestamp      |
| user_id      | uuid        | nullable, FK to auth.users(id)            | Application owner              |
| company      | text        | not null                                  | Company name                   |
| role         | text        | not null                                  | Role title                     |
| website      | text        | nullable                                  | Company website/domain         |
| logo_url     | text        | nullable                                  | Favicon or logo URL            |
| date_applied | date        | not null                                  | Date application was submitted |
| status       | text        | not null                                  | No database status CHECK       |
| notes        | text        | nullable                                  | No database length CHECK       |

The foreign key uses ON DELETE CASCADE. The recorded named constraints are the
primary key and this foreign key; no validation CHECK constraints are present.

### Deployed indexes

Only `applications_pkey`, the primary-key index, is present in the snapshot.

## Ownership and Row Level Security

RLS is enabled. Four policies apply to `authenticated`, using
`auth.uid() = user_id`:

- Users can view their own applications
- Users can insert their own applications
- Users can update their own applications
- Users can delete their own applications

SELECT/DELETE check existing ownership, INSERT checks the new owner, and UPDATE
checks both. New authenticated inserts and updates must match the signed-in
user. The nullable column does not grant access to unowned rows: NULL does not
satisfy the ownership predicate. Anonymous table access is revoked.

See the [deployed repair record](database-migrations.md) for exact SQL and evidence.

## Historical expectations — not deployed

The historical migration SQL describes additional constraints and indexes:

- `user_id NOT NULL`.
- A status CHECK allowing Applied, Interview, Offer and Rejected.
- CHECK constraints for trimmed company length 2–50, trimmed role length 2–80,
  and notes length up to 500 characters.
- `applications_user_id_idx` and `applications_created_at_idx`.

These are not current database guarantees. Application-side validation is
separate from database enforcement. Any future adoption of these constraints
or indexes needs review under [issue #140](https://github.com/simbongile-mkhotheli/JobTracker/issues/140);
this documentation does not approve those changes or historical migration replay.
