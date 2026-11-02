
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $preflight$
DECLARE
  n integer;
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_catalog.pg_class WHERE oid = 'public.applications'::regclass)
     OR pg_get_serial_sequence('public.applications','id') IS DISTINCT FROM 'public.applications_id_seq' THEN
    RAISE EXCEPTION 'Unexpected applications table or identity configuration; no repair applied';
  END IF;
  SELECT count(*) INTO n
  FROM pg_catalog.pg_policies
  WHERE schemaname='public' AND tablename='applications';
  IF n <> 8 THEN
    RAISE EXCEPTION 'Expected eight existing application policies, found %; no repair applied', n;
  END IF;
  SELECT count(*) INTO n
  FROM pg_catalog.pg_policies
  WHERE schemaname='public' AND tablename='applications'
    AND permissive='PERMISSIVE' AND roles::text='{public}'
    AND (
      (policyname='Enable read access for all users' AND cmd='SELECT' AND qual='true')
      OR (policyname='Enable insert access for all users' AND cmd='INSERT' AND with_check='true')
      OR (policyname='Enable update access for all users' AND cmd='UPDATE' AND qual='true')
      OR (policyname='Enable delete access for all users' AND cmd='DELETE' AND qual='true')
    );
  IF n <> 4 THEN
    RAISE EXCEPTION 'The expected four allow-all policies do not match; no repair applied';
  END IF;
  SELECT count(*) INTO n
  FROM pg_catalog.pg_policies
  WHERE schemaname='public' AND tablename='applications'
    AND permissive='PERMISSIVE' AND roles::text='{public}'
    AND (
      (policyname='Users can view their own applications' AND cmd='SELECT' AND qual='(auth.uid() = user_id)')
      OR (policyname='Users can insert their own applications' AND cmd='INSERT' AND with_check='(auth.uid() = user_id)')
      OR (policyname='Users can update their own applications' AND cmd='UPDATE' AND qual='(auth.uid() = user_id)' AND with_check='(auth.uid() = user_id)')
      OR (policyname='Users can delete their own applications' AND cmd='DELETE' AND qual='(auth.uid() = user_id)')
    );
  IF n <> 4 THEN
    RAISE EXCEPTION 'Ownership policies differ from reviewed baseline; no repair applied';
  END IF;
END $preflight$;

LOCK TABLE public.applications IN ACCESS EXCLUSIVE MODE;

DROP POLICY "Enable read access for all users" ON public.applications;
DROP POLICY "Enable insert access for all users" ON public.applications;
DROP POLICY "Enable update access for all users" ON public.applications;
DROP POLICY "Enable delete access for all users" ON public.applications;

ALTER POLICY "Users can view their own applications" ON public.applications
  TO authenticated USING (auth.uid() = user_id);
ALTER POLICY "Users can insert their own applications" ON public.applications
  TO authenticated WITH CHECK (auth.uid() = user_id);
ALTER POLICY "Users can update their own applications" ON public.applications
  TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
ALTER POLICY "Users can delete their own applications" ON public.applications
  TO authenticated USING (auth.uid() = user_id);

REVOKE ALL PRIVILEGES ON TABLE public.applications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.applications TO authenticated;
REVOKE ALL PRIVILEGES ON SEQUENCE public.applications_id_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SEQUENCE public.applications_id_seq TO authenticated;

DO $verify$
DECLARE
  n integer;
BEGIN
  SELECT count(*) INTO n
    FROM pg_catalog.pg_policies
   WHERE schemaname='public' AND tablename='applications';
  IF n <> 4 THEN
    RAISE EXCEPTION 'Expected exactly 4 policies after repair, found %', n;
  END IF;
  SELECT count(*) INTO n
  FROM pg_catalog.pg_policies
  WHERE schemaname='public' AND tablename='applications'
    AND permissive='PERMISSIVE' AND roles::text='{authenticated}'
    AND (
      (policyname='Users can view their own applications' AND cmd='SELECT' AND qual='(auth.uid() = user_id)')
      OR (policyname='Users can insert their own applications' AND cmd='INSERT' AND with_check='(auth.uid() = user_id)')
      OR (policyname='Users can update their own applications' AND cmd='UPDATE' AND qual='(auth.uid() = user_id)' AND with_check='(auth.uid() = user_id)')
      OR (policyname='Users can delete their own applications' AND cmd='DELETE' AND qual='(auth.uid() = user_id)')
    );
  IF n <> 4 THEN
    RAISE EXCEPTION 'Unexpected ownership policy configuration after repair';
  END IF;
  IF has_table_privilege('anon','public.applications','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
    OR has_any_column_privilege('anon','public.applications','SELECT,INSERT,UPDATE,REFERENCES')
    OR has_sequence_privilege('anon','public.applications_id_seq','USAGE,SELECT,UPDATE') THEN
    RAISE EXCEPTION 'Anonymous privileges remain';
  END IF;
  IF NOT (has_table_privilege('authenticated','public.applications','SELECT')
    AND has_table_privilege('authenticated','public.applications','INSERT')
    AND has_table_privilege('authenticated','public.applications','UPDATE')
    AND has_table_privilege('authenticated','public.applications','DELETE')
    AND has_sequence_privilege('authenticated','public.applications_id_seq','USAGE')) THEN
    RAISE EXCEPTION 'Required authenticated privileges are missing';
  END IF;
  IF has_table_privilege('authenticated','public.applications','TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
    OR has_any_column_privilege('authenticated','public.applications','REFERENCES')
    OR has_any_column_privilege('authenticated','public.applications','SELECT WITH GRANT OPTION,INSERT WITH GRANT OPTION,UPDATE WITH GRANT OPTION')
    OR has_sequence_privilege('authenticated','public.applications_id_seq','SELECT,UPDATE') THEN
    RAISE EXCEPTION 'Excess authenticated privileges remain';
  END IF;
END $verify$;
