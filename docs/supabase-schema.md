# JobTracker Supabase Schema

## Table: applications

### Columns

| Column      | Type        | Constraints                                 | Notes                               |
| ----------- | ----------- | ------------------------------------------- | ----------------------------------- |
| id          | bigint      | primary key, identity                       | Application identifier              |
| created_at  | timestamptz | not null, default now()                     | Record creation timestamp           |
| user_id     | uuid        | not null, FK to auth.users(id)              | Owner of the application            |
| company     | text        | not null                                    | Company name                        |
| role        | text        | not null                                    | Role title                          |
| website     | text        | nullable                                    | Company website/domain              |
| logoUrl     | text        | nullable                                    | Favicon or logo URL                 |
| dateApplied | date        | not null                                    | Date application was submitted      |
| status      | text        | not null, default Applied, check constraint | Applied, Interview, Offer, Rejected |
| notes       | text        | nullable                                    | Optional notes, max 500 chars       |

## Indexes

- applications_user_id_idx
- applications_created_at_idx

## Row Level Security Policies

- Users can view their own applications
- Users can insert their own applications
- Users can update their own applications
- Users can delete their own applications

## Ownership Rule

Every application must belong to a single authenticated user via `user_id`.
