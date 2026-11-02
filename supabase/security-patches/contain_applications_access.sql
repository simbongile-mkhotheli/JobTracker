-- TEMPORARY DENIAL OF CLIENT ACCESS, not the ownership repair.
-- Requires separate production approval. Use the same single-transaction
-- executor as the repair. Legitimate application CRUD will be unavailable.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL transaction_timeout = '60s';
SET LOCAL search_path = pg_catalog;

LOCK TABLE public.applications IN ACCESS EXCLUSIVE MODE;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.applications
  FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON SEQUENCE public.applications_id_seq
  FROM PUBLIC, anon, authenticated;

DO $verify$
BEGIN
  IF has_table_privilege('anon', 'public.applications',
       'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     OR has_any_column_privilege('anon', 'public.applications',
       'SELECT,INSERT,UPDATE,REFERENCES')
     OR has_sequence_privilege('anon', 'public.applications_id_seq',
       'USAGE,SELECT,UPDATE')
     OR has_table_privilege('authenticated', 'public.applications',
       'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     OR has_any_column_privilege('authenticated', 'public.applications',
       'SELECT,INSERT,UPDATE,REFERENCES')
     OR has_sequence_privilege('authenticated', 'public.applications_id_seq',
       'USAGE,SELECT,UPDATE') THEN
    RAISE EXCEPTION 'Containment incomplete: effective client privileges remain';
  END IF;
END;
$verify$;
