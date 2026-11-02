import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { boundedFetch } from "./http.js";
import {
  applySql,
  containmentPath,
  fixturePath,
  inspectSecurity,
  repairPath,
  runSql,
  validatePrerequisites,
} from "./database.js";

function checked(response) {
  expect(response.error).toBeNull();
  return response.data;
}

function assertNoForeignRows(rows, foreignId) {
  assert.equal(
    rows.some((row) => row.id === foreignId),
    false,
    "Cross-user rows must not be visible",
  );
}

describe.sequential(
  "applications ownership on an approved disposable Supabase project",
  () => {
    let a;
    let b;
    let anonymous;
    let userA;
    let userB;
    let seedA;
    let seedB;
    let requestSignal;
    const createdRows = [];

    function payload(owner) {
      return {
        company: "JT-test-" + randomUUID(),
        role: "Synthetic security fixture",
        website: "",
        logo_url: "",
        date_applied: "2026-01-01",
        status: "Applied",
        notes: "Synthetic data only",
        user_id: owner,
      };
    }

    async function createRow(client, owner) {
      const candidate = payload(owner);
      // Track the unique marker before sending a write: its response may be lost.
      const tracked = { company: candidate.company };
      createdRows.push(tracked);
      const row = checked(
        await client
          .from("applications")
          .insert(candidate)
          .select("*")
          .abortSignal(requestSignal)
          .single(),
      );
      tracked.id = row.id;
      expect(Number.isSafeInteger(row.id) && row.id > 0).toBe(true);
      expect(row.user_id).toBe(owner);
      return row;
    }

    async function readRow(client, row) {
      return checked(
        await client
          .from("applications")
          .select("*")
          .eq("id", row.id)
          .abortSignal(requestSignal)
          .single(),
      );
    }

    async function ownCrud(client, owner) {
      const row = await createRow(client, owner);
      expect(await readRow(client, row)).toEqual(row);
      const saved = checked(
        await client
          .from("applications")
          .update({ notes: "Own update" })
          .eq("id", row.id)
          .select("*")
          .abortSignal(requestSignal)
          .single(),
      );
      expect(saved.notes).toBe("Own update");
      expect(saved.user_id).toBe(owner);
      expect(await readRow(client, row)).toEqual(saved);
      const removed = checked(
        await client
          .from("applications")
          .delete()
          .eq("id", row.id)
          .select("id")
          .abortSignal(requestSignal),
      );
      expect(removed).toEqual([{ id: row.id }]);
      expect(
        checked(
          await client
            .from("applications")
            .select("id")
            .eq("id", row.id)
            .abortSignal(requestSignal),
        ),
      ).toEqual([]);
    }

    beforeAll(async () => {
      const config = validatePrerequisites();
      requestSignal = AbortSignal.timeout(110000);
      const options = {
        global: { fetch: boundedFetch(() => requestSignal) },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      };
      a = createClient(config.url, config.key, options);
      b = createClient(config.url, config.key, options);
      anonymous = createClient(config.url, config.key, options);

      for (const [client, email, password] of [
        [a, config.emailA, config.passwordA],
        [b, config.emailB, config.passwordB],
      ]) {
        const data = checked(
          await client.auth.signInWithPassword({ email, password }),
        );
        // Never print or compare a session object containing tokens.
        expect(Boolean(data.session)).toBe(true);
      }
      userA = checked(await a.auth.getUser()).user.id;
      userB = checked(await b.auth.getUser()).user.id;
      expect(userA).not.toBe(userB);
      expect(checked(await anonymous.auth.getSession()).session).toBeNull();

      applySql(fixturePath);

      // A freshly created table may need a brief PostgREST schema-cache refresh.
      // Poll only the documented table-not-in-cache response; other errors fail.
      let tableReady = false;
      for (let attempt = 0; attempt < 25; attempt += 1) {
        const response = await a
          .from("applications")
          .select("id")
          .limit(1)
          .abortSignal(requestSignal);
        if (!response.error) {
          tableReady = true;
          break;
        }
        if (response.error.code !== "PGRST205") checked(response);
        await delay(200, undefined, { signal: requestSignal });
      }
      expect(tableReady).toBe(true);

      // Required positive controls precede every negative authorization assertion.
      await ownCrud(a, userA);
      await ownCrud(b, userB);
      seedA = await createRow(a, userA);
      seedB = await createRow(b, userB);
    });

    beforeEach(({ signal }) => {
      requestSignal = signal;
    });

    afterAll(async () => {
      // Cleanup must remain possible after Vitest has cancelled a test signal.
      requestSignal = AbortSignal.timeout(60000);
      const errors = [];
      // Only unique tracked synthetic markers (plus IDs when known) are eligible.
      // No table reset, broad deletion, privileged data client, or user deletion.
      for (const [index, row] of createdRows.entries()) {
        for (const [label, client, owner] of [
          ["A", a, userA],
          ["B", b, userB],
        ]) {
          if (!client || !owner) continue;
          try {
            let deletion = client
              .from("applications")
              .delete()
              .eq("company", row.company)
              .eq("user_id", owner)
              .abortSignal(requestSignal);
            if (row.id !== undefined) deletion = deletion.eq("id", row.id);
            checked(await deletion);
            expect(
              checked(
                await client
                  .from("applications")
                  .select("id")
                  .eq("company", row.company)
                  .eq("user_id", owner)
                  .abortSignal(requestSignal),
              ),
            ).toEqual([]);
          } catch {
            // Report every failed attempt without leaking SDK/libpq credentials.
            errors.push(
              new Error(
                `Synthetic fixture ${index + 1}, user ${label}: cleanup failed; inspect the disposable project.`,
              ),
            );
          }
        }
      }
      if (errors.length)
        throw new AggregateError(
          errors,
          "Synthetic cleanup incomplete; do not reuse this disposable project.",
        );
    }, 70000);

    it("proves the legacy configuration fails the cross-user read invariant", async () => {
      const rows = checked(
        await b.from("applications").select("id").abortSignal(requestSignal),
      );
      expect(rows.some((row) => row.id === seedB.id)).toBe(true);
      expect(rows.some((row) => row.id === seedA.id)).toBe(true);
      // This exact invariant is reused after repair. The error-free response and
      // known foreign row above exclude an unavailable API as the expected failure.
      expect(() => assertNoForeignRows(rows, seedA.id)).toThrow(
        /Cross-user rows must not be visible/,
      );
    });

    it("proves the legacy configuration exposes a known synthetic row anonymously", async () => {
      const rows = checked(
        await anonymous
          .from("applications")
          .select("id")
          .abortSignal(requestSignal),
      );
      expect(rows.some((row) => row.id === seedA.id)).toBe(true);
      expect(() => assertNoForeignRows(rows, seedA.id)).toThrow(
        /Cross-user rows must not be visible/,
      );
    });

    it("rolls back all candidate changes when a later statement deliberately fails", async () => {
      const before = inspectSecurity();
      const result = runSql(
        [repairPath],
        [
          "DO $probe$ BEGIN RAISE EXCEPTION 'JOBTRACKER_SECURITY_ROLLBACK_PROBE'; END; $probe$;",
        ],
      );
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(3);
      // A patch syntax/precondition error is not a successful rollback probe.
      expect(result.stderr.includes("JOBTRACKER_SECURITY_ROLLBACK_PROBE")).toBe(
        true,
      );
      expect(inspectSecurity()).toEqual(before);
      expect(await readRow(a, seedA)).toEqual(seedA);
      expect(await readRow(b, seedB)).toEqual(seedB);
    }, 75000);

    it("applies the repair without changing existing synthetic records or schema", async () => {
      const before = inspectSecurity();
      applySql(repairPath);
      const after = inspectSecurity();
      expect(after.columns).toEqual(before.columns);
      expect(after.constraints).toEqual(before.constraints);
      expect(after.owner).toBe(before.owner);
      expect(after.rls_forced).toBe(before.rls_forced);
      expect(after.non_client_table_acl).toEqual(before.non_client_table_acl);
      expect(after.non_client_sequence_acl).toEqual(
        before.non_client_sequence_acl,
      );
      expect(after.policies).toHaveLength(4);
      expect(after.rls_enabled).toBe(true);
      expect(await readRow(a, seedA)).toEqual(seedA);
      expect(await readRow(b, seedB)).toEqual(seedB);
    }, 75000);

    it("preserves generated-ID own-user CRUD for both authenticated users", async () => {
      await ownCrud(a, userA);
      await ownCrud(b, userB);
    });

    it("filters unscoped reads and guessed foreign IDs for both users", async () => {
      const rowsA = checked(
        await a.from("applications").select("id").abortSignal(requestSignal),
      );
      const rowsB = checked(
        await b.from("applications").select("id").abortSignal(requestSignal),
      );
      expect(rowsA.some((row) => row.id === seedA.id)).toBe(true);
      expect(rowsB.some((row) => row.id === seedB.id)).toBe(true);
      assertNoForeignRows(rowsA, seedB.id);
      assertNoForeignRows(rowsB, seedA.id);
      expect(
        checked(
          await b
            .from("applications")
            .select("id")
            .eq("id", seedA.id)
            .abortSignal(requestSignal),
        ),
      ).toEqual([]);
    });

    it.each(["update", "delete"])(
      "denies a cross-user %s and preserves the owner's record",
      async (operation) => {
        const row = await createRow(a, userA);
        const request =
          operation === "update"
            ? b.from("applications").update({ notes: "Unauthorized change" })
            : b.from("applications").delete();
        const scoped = request.eq("id", row.id).abortSignal(requestSignal);
        const affected = checked(
          await (operation === "delete" ? scoped.select("id") : scoped),
        );
        if (operation === "delete") expect(affected).toEqual([]);
        expect(await readRow(a, row)).toEqual(row);
      },
    );

    it("rejects insertion with another valid user's identity", async () => {
      const forged = payload(userB);
      createdRows.push({ company: forged.company });
      // No RETURNING: a restrictive SELECT policy must not mask a broken INSERT check.
      const result = await a
        .from("applications")
        .insert(forged)
        .abortSignal(requestSignal);
      expect(result.error?.code).toBe("42501");
      expect(
        checked(
          await b
            .from("applications")
            .select("id")
            .eq("company", forged.company)
            .abortSignal(requestSignal),
        ),
      ).toEqual([]);
    });

    it("rejects ownership reassignment and preserves the original values", async () => {
      const row = await createRow(a, userA);
      const result = await a
        .from("applications")
        .update({ user_id: userB })
        .eq("id", row.id)
        .abortSignal(requestSignal);
      expect(result.error?.code).toBe("42501");
      expect(await readRow(a, row)).toEqual(row);
      expect(
        checked(
          await b
            .from("applications")
            .select("id")
            .eq("id", row.id)
            .abortSignal(requestSignal),
        ),
      ).toEqual([]);
    });

    it.each(["select", "insert", "update", "delete"])(
      "denies anonymous %s and preserves the target record",
      async (operation) => {
        const row = await createRow(a, userA);
        const candidate = operation === "insert" ? payload(userA) : undefined;
        if (candidate) createdRows.push({ company: candidate.company });
        let request;
        if (operation === "select") {
          request = anonymous
            .from("applications")
            .select("id")
            .eq("id", row.id);
        } else if (operation === "insert") {
          request = anonymous.from("applications").insert(candidate);
        } else if (operation === "update") {
          request = anonymous
            .from("applications")
            .update({ notes: "Anonymous change" })
            .eq("id", row.id);
        } else {
          request = anonymous
            .from("applications")
            .delete()
            .eq("id", row.id)
            .select("id");
        }
        const result = await request.abortSignal(requestSignal);
        expect(result.error?.code).toBe("42501");
        expect(await readRow(a, row)).toEqual(row);
        if (candidate)
          expect(
            checked(
              await a
                .from("applications")
                .select("id")
                .eq("company", candidate.company)
                .abortSignal(requestSignal),
            ),
          ).toEqual([]);
      },
    );

    it("temporarily denies client access and recovers without allow-all policies", async () => {
      let verificationError;
      try {
        applySql(containmentPath);
        for (const client of [a, b, anonymous]) {
          const result = await client
            .from("applications")
            .select("id")
            .abortSignal(requestSignal);
          expect(result.error?.code).toBe("42501");
        }
        const metadata = inspectSecurity();
        for (const role of metadata.client_roles) {
          expect([
            role.select,
            role.insert,
            role.update,
            role.delete,
            role.excess_table,
            role.any_column,
            role.sequence_usage,
            role.sequence_select_or_update,
          ]).toEqual([false, false, false, false, false, false, false, false]);
        }
      } catch (error) {
        verificationError = error;
      }
      try {
        applySql(repairPath);
      } catch (error) {
        throw new AggregateError(
          [verificationError, error].filter(Boolean),
          "Secure recovery failed; inspect and quarantine the disposable project.",
          { cause: error },
        );
      }
      if (verificationError) throw verificationError;
      expect(inspectSecurity().policies).toHaveLength(4);
      expect(await readRow(a, seedA)).toEqual(seedA);
      expect(await readRow(b, seedB)).toEqual(seedB);
    }, 75000);
  },
);
