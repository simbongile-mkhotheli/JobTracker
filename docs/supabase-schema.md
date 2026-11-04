# JobTracker Supabase schema

The hosted JobTracker database (`urzvwixshavciyktjlhw`) uses the
[initial applications migration](../supabase/migrations/20261102175831_initial_applications.sql)
recorded as version `20261102175831`. The earlier catalog snapshot in the
[security archive](security/deployed/20261102122254.metadata.json) describes the
schema before this rebuild.

## Table `public.applications`

| Column       | Type        | Constraints and defaults                                    |
| ------------ | ----------- | ----------------------------------------------------------- |
| id           | bigint      | Primary key, `GENERATED ALWAYS AS IDENTITY`                 |
| created_at   | timestamptz | Required, defaults to `now()`                               |
| user_id      | uuid        | Required, references `auth.users(id)` with deletion cascade |
| company      | text        | Required, trimmed length 2–50 characters                    |
| role         | text        | Required, trimmed length 2–80 characters                    |
| website      | text        | Optional                                                    |
| logo_url     | text        | Optional                                                    |
| date_applied | date        | Required                                                    |
| status       | text        | Required, defaults to `Applied`                             |
| notes        | text        | Optional, maximum length 500 characters                     |

The status CHECK allows `Applied`, `Interview`, `Offer`, and `Rejected`. Deleting
an Auth account cascades to that account's applications. The database constraints
back up form validation. Website normalization stays in the application.

The primary key indexes `id`. The composite index
`applications_user_created_at_idx` on `(user_id, created_at DESC)` supports each
user's newest-first application list.

## Ownership and Row Level Security

RLS is enabled with four permanent policies for `authenticated`. Each compares
`auth.uid()` with `user_id`.

| Operation | Ownership checked          |
| --------- | -------------------------- |
| SELECT    | Existing row               |
| INSERT    | New row                    |
| UPDATE    | Existing and resulting row |
| DELETE    | Existing row               |

Authenticated users have table CRUD privileges. RLS limits which rows those
privileges can reach. The update policy prevents changing a row's owner to
another user. Anonymous clients have no application table access, and client
roles have no direct identity-sequence privileges. PostgreSQL generates IDs
when an application is inserted.

The temporary maintenance policy was removed after hosted security verification.
See the [migration and recovery record](database-migrations.md) for verification
results and the historical repair evidence.
