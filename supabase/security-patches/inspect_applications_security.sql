-- Metadata only. No application rows, auth users, or sequence values are read.
-- Stable ordering allows comparison before/after an intentional rollback probe.
-- Run through the reviewed psql executor; this file does not change security.
SELECT jsonb_build_object(
  'postgres_major', current_setting('server_version_num')::integer / 10000,
  'owner', pg_get_userbyid(c.relowner),
  'rls_enabled', c.relrowsecurity,
  'rls_forced', c.relforcerowsecurity,
  'table_acl', c.relacl::text,
  'non_client_table_acl', (
    SELECT jsonb_agg(jsonb_build_array(x.grantee, x.grantor, x.privilege_type,
      x.is_grantable) ORDER BY x.grantee, x.privilege_type)
    FROM aclexplode(c.relacl) AS x
    WHERE x.grantee <> 0 AND x.grantee NOT IN (
      SELECT oid FROM pg_catalog.pg_roles WHERE rolname IN ('anon', 'authenticated')
    )
  ),
  'sequence_name', pg_get_serial_sequence('public.applications', 'id'),
  'sequence_acl', (
    SELECT s.relacl::text FROM pg_catalog.pg_class AS s
    WHERE s.oid = to_regclass(pg_get_serial_sequence('public.applications', 'id'))
  ),
  'non_client_sequence_acl', (
    SELECT jsonb_agg(jsonb_build_array(x.grantee, x.grantor, x.privilege_type,
      x.is_grantable) ORDER BY x.grantee, x.privilege_type)
    FROM pg_catalog.pg_class AS s CROSS JOIN LATERAL aclexplode(s.relacl) AS x
    WHERE s.oid = to_regclass(pg_get_serial_sequence('public.applications', 'id'))
      AND x.grantee <> 0 AND x.grantee NOT IN (
        SELECT oid FROM pg_catalog.pg_roles WHERE rolname IN ('anon', 'authenticated')
      )
  ),
  'columns', (
    SELECT jsonb_agg(jsonb_build_object(
      'name', a.attname, 'type', format_type(a.atttypid, a.atttypmod),
      'not_null', a.attnotnull, 'identity', a.attidentity,
      'acl', a.attacl::text
    ) ORDER BY a.attnum)
    FROM pg_catalog.pg_attribute AS a
    WHERE a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
  ),
  'constraints', (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'name', k.conname, 'definition', pg_get_constraintdef(k.oid)
    ) ORDER BY k.conname), '[]'::jsonb)
    FROM pg_catalog.pg_constraint AS k WHERE k.conrelid = c.oid
  ),
  'policies', (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'name', p.policyname, 'command', p.cmd, 'roles', p.roles,
      'permissive', p.permissive, 'using', p.qual, 'with_check', p.with_check
    ) ORDER BY p.policyname), '[]'::jsonb)
    FROM pg_catalog.pg_policies AS p
    WHERE p.schemaname = 'public' AND p.tablename = 'applications'
  ),
  'client_roles', (
    SELECT jsonb_agg(jsonb_build_object(
      'name', r.rolname, 'superuser', r.rolsuper, 'bypassrls', r.rolbypassrls,
      'select', has_table_privilege(r.oid, c.oid, 'SELECT'),
      'insert', has_table_privilege(r.oid, c.oid, 'INSERT'),
      'update', has_table_privilege(r.oid, c.oid, 'UPDATE'),
      'delete', has_table_privilege(r.oid, c.oid, 'DELETE'),
      'excess_table', has_table_privilege(r.oid, c.oid,
        'TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'),
      'any_column', has_any_column_privilege(r.oid, c.oid,
        'SELECT,INSERT,UPDATE,REFERENCES'),
      'sequence_usage', has_sequence_privilege(r.oid,
        to_regclass(pg_get_serial_sequence('public.applications', 'id')), 'USAGE'),
      'sequence_select_or_update', has_sequence_privilege(r.oid,
        to_regclass(pg_get_serial_sequence('public.applications', 'id')), 'SELECT,UPDATE')
    ) ORDER BY r.rolname)
    FROM pg_catalog.pg_roles AS r WHERE r.rolname IN ('anon', 'authenticated')
  ),
  'migration_history_table', to_regclass('supabase_migrations.schema_migrations')::text
)
FROM pg_catalog.pg_class AS c WHERE c.oid = 'public.applications'::regclass;
