-- PostgreSQL 17 transaction body. Execute with psql -X -w --single-transaction
-- --set=ON_ERROR_STOP=1 --file=<this file>. Do not execute statement by statement.
-- No application records, column definitions, or sequence values are changed.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL transaction_timeout = '60s';
SET LOCAL search_path = pg_catalog;

LOCK TABLE public.applications IN ACCESS EXCLUSIVE MODE;

DO $preflight$
BEGIN
  IF current_setting('server_version_num')::integer / 10000 <> 17 THEN
    RAISE EXCEPTION 'This repair requires the reviewed PostgreSQL 17 environment';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class AS c
    JOIN pg_catalog.pg_roles AS r ON r.oid = c.relowner
    WHERE c.oid = 'public.applications'::regclass
      AND r.rolname = current_user
  ) THEN
    RAISE EXCEPTION 'Run the repair as the applications table owner';
  END IF;

  IF pg_get_serial_sequence('public.applications', 'id')
       IS DISTINCT FROM 'public.applications_id_seq'
     OR NOT EXISTS (
       SELECT 1 FROM pg_catalog.pg_attribute
       WHERE attrelid = 'public.applications'::regclass
         AND attname = 'id' AND attidentity IN ('a', 'd')
         AND NOT attisdropped
     ) THEN
    RAISE EXCEPTION 'Unexpected applications identity sequence';
  END IF;

  IF (SELECT count(*) FROM pg_catalog.pg_roles
      WHERE rolname IN ('anon', 'authenticated')) <> 2
     OR EXISTS (
       SELECT 1
       FROM pg_catalog.pg_roles AS r
       JOIN pg_catalog.pg_class AS c
         ON c.oid = 'public.applications'::regclass
       WHERE r.rolname IN ('anon', 'authenticated')
         AND (r.rolsuper OR r.rolbypassrls
              OR pg_has_role(r.oid, c.relowner, 'USAGE'))
     ) THEN
    RAISE EXCEPTION 'Client roles are missing or have privileged access';
  END IF;
END;
$preflight$;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users"
  ON public.applications;
DROP POLICY IF EXISTS "Enable insert access for all users"
  ON public.applications;
DROP POLICY IF EXISTS "Enable update access for all users"
  ON public.applications;
DROP POLICY IF EXISTS "Enable delete access for all users"
  ON public.applications;

ALTER POLICY "Users can view their own applications"
  ON public.applications TO authenticated
  USING (auth.uid() = user_id);

ALTER POLICY "Users can insert their own applications"
  ON public.applications TO authenticated
  WITH CHECK (auth.uid() = user_id);

ALTER POLICY "Users can update their own applications"
  ON public.applications TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER POLICY "Users can delete their own applications"
  ON public.applications TO authenticated
  USING (auth.uid() = user_id);

REVOKE ALL PRIVILEGES ON TABLE public.applications
  FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.applications
  TO authenticated;

REVOKE ALL PRIVILEGES ON SEQUENCE public.applications_id_seq
  FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SEQUENCE public.applications_id_seq TO authenticated;

DO $verify$
DECLARE
  ownership_policy_count integer;
BEGIN
  SELECT count(*) INTO ownership_policy_count
  FROM pg_catalog.pg_policies AS p
  JOIN (
    VALUES
      ('Users can view their own applications', 'SELECT', true, false),
      ('Users can insert their own applications', 'INSERT', false, true),
      ('Users can update their own applications', 'UPDATE', true, true),
      ('Users can delete their own applications', 'DELETE', true, false)
  ) AS expected(policyname, command, checks_existing, checks_result)
    ON p.policyname = expected.policyname AND p.cmd = expected.command
  WHERE p.schemaname = 'public' AND p.tablename = 'applications'
    AND p.permissive = 'PERMISSIVE'
    AND p.roles = ARRAY['authenticated']::name[]
    AND CASE WHEN expected.checks_existing
      THEN regexp_replace(p.qual, '[[:space:]]', '', 'g')
        IN ('(auth.uid()=user_id)', 'auth.uid()=user_id')
      ELSE p.qual IS NULL END
    AND CASE WHEN expected.checks_result
      THEN regexp_replace(p.with_check, '[[:space:]]', '', 'g')
        IN ('(auth.uid()=user_id)', 'auth.uid()=user_id')
      ELSE p.with_check IS NULL END;

  IF ownership_policy_count <> 4 OR (
    SELECT count(*) FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'applications'
  ) <> 4 THEN
    RAISE EXCEPTION 'Unexpected applications policy names, roles, commands, or predicates';
  END IF;

  IF NOT (SELECT relrowsecurity FROM pg_catalog.pg_class
          WHERE oid = 'public.applications'::regclass) THEN
    RAISE EXCEPTION 'Applications RLS is not enabled';
  END IF;

  IF has_table_privilege('anon', 'public.applications',
       'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     OR has_any_column_privilege('anon', 'public.applications',
       'SELECT,INSERT,UPDATE,REFERENCES')
     OR has_sequence_privilege('anon', 'public.applications_id_seq',
       'USAGE,SELECT,UPDATE') THEN
    RAISE EXCEPTION 'Anonymous effective privileges remain';
  END IF;

  -- A comma-separated privilege list means ANY, not ALL. Check each required
  -- authenticated privilege separately.
  IF NOT (
    has_schema_privilege('authenticated', 'public', 'USAGE')
    AND has_table_privilege('authenticated', 'public.applications', 'SELECT')
    AND has_table_privilege('authenticated', 'public.applications', 'INSERT')
    AND has_table_privilege('authenticated', 'public.applications', 'UPDATE')
    AND has_table_privilege('authenticated', 'public.applications', 'DELETE')
    AND has_sequence_privilege('authenticated', 'public.applications_id_seq', 'USAGE')
  ) THEN
    RAISE EXCEPTION 'Required authenticated privileges are missing';
  END IF;

  IF has_table_privilege('authenticated', 'public.applications',
       'TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
     -- Table checks alone miss column grants inherited through another role.
     OR has_any_column_privilege('authenticated', 'public.applications',
       'REFERENCES,SELECT WITH GRANT OPTION,INSERT WITH GRANT OPTION,UPDATE WITH GRANT OPTION')
     OR has_sequence_privilege('authenticated', 'public.applications_id_seq',
       'SELECT,UPDATE')
     OR has_table_privilege('authenticated', 'public.applications',
       'SELECT WITH GRANT OPTION,INSERT WITH GRANT OPTION,UPDATE WITH GRANT OPTION,DELETE WITH GRANT OPTION')
     OR has_sequence_privilege('authenticated', 'public.applications_id_seq',
       'USAGE WITH GRANT OPTION') THEN
    RAISE EXCEPTION 'Excess authenticated table, column, or sequence privileges/grant options remain; investigate inherited grants';
  END IF;
END;
$verify$;
