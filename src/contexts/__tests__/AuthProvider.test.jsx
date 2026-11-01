import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../AuthProvider";
import { useAuth } from "../../hooks/useAuth";

const { auth } = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
}));

vi.mock("../../lib/supabase", () => ({ supabase: { auth } }));

const session = { user: { id: "user-1", email: "person@example.com" } };

describe("AuthProvider", () => {
  let onAuthChange;
  let unsubscribe;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    unsubscribe = vi.fn();
    auth.onAuthStateChange.mockImplementation((callback) => {
      onAuthChange = callback;
      return { data: { subscription: { unsubscribe } } };
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("keeps auth loading until the saved session resolves", async () => {
    let resolveSession;
    auth.getSession.mockReturnValue(
      new Promise((resolve) => {
        resolveSession = resolve;
      }),
    );
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    await act(async () => resolveSession({ data: { session }, error: null }));

    expect(result.current.loading).toBe(false);
    expect(result.current.session).toEqual(session);
    expect(result.current.user).toEqual(session.user);
  });

  it("finishes loading as signed out when no saved session exists", async () => {
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it.each(["returned", "rejected"])(
    "releases loading and clears auth on a %s session failure",
    async (failure) => {
      const error = Object.assign(new Error("Session unavailable"), {
        code: "session_not_found",
      });
      if (failure === "returned")
        auth.getSession.mockResolvedValue({ data: { session }, error });
      else auth.getSession.mockRejectedValue(error);

      const { result } = renderHook(useAuth, { wrapper: AuthProvider });
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "Failed to load session:",
        expect.objectContaining({
          operation: "loadSession",
          code: "session_not_found",
        }),
      );
    },
  );

  it("updates consumers on sign-in, token refresh, and sign-out events", async () => {
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => onAuthChange("SIGNED_IN", session));
    expect(result.current.user).toEqual(session.user);
    const refreshed = { ...session, expires_at: 123456 };
    act(() => onAuthChange("TOKEN_REFRESHED", refreshed));
    expect(result.current.session).toEqual(refreshed);
    act(() => onAuthChange("SIGNED_OUT", null));
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it.each([
    ["SIGNED_IN", session, null],
    ["SIGNED_OUT", null, session],
  ])(
    "preserves a newer %s event when the bootstrap request resolves late",
    async (event, nextSession, staleSession) => {
      let resolveSession;
      auth.getSession.mockReturnValue(
        new Promise((resolve) => {
          resolveSession = resolve;
        }),
      );
      const { result } = renderHook(useAuth, { wrapper: AuthProvider });

      act(() => onAuthChange(event, nextSession));
      expect(result.current.loading).toBe(false);
      await act(async () =>
        resolveSession({ data: { session: staleSession }, error: null }),
      );

      expect(result.current.session).toEqual(nextSession);
      expect(result.current.user).toEqual(nextSession?.user ?? null);
    },
  );

  it("keeps a newly signed-in session if the older bootstrap request rejects", async () => {
    let rejectSession;
    auth.getSession.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectSession = reject;
      }),
    );
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });

    act(() => onAuthChange("SIGNED_IN", session));
    await act(async () => rejectSession(new Error("Stale bootstrap failure")));

    expect(result.current.session).toEqual(session);
    expect(result.current.user).toEqual(session.user);
    expect(result.current.loading).toBe(false);
  });

  it("unsubscribes and ignores a session request that finishes after unmount", async () => {
    let rejectSession;
    auth.getSession.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectSession = reject;
      }),
    );
    const { unmount } = renderHook(useAuth, { wrapper: AuthProvider });
    unmount();
    await act(async () => rejectSession(new Error("Late failure")));

    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(console.error).not.toHaveBeenCalled();
  });

  it.each([
    ["signIn", "signInWithPassword"],
    ["signUp", "signUp"],
  ])(
    "returns %s results and propagates provider errors",
    async (method, providerMethod) => {
      const { result } = renderHook(useAuth, { wrapper: AuthProvider });
      await waitFor(() => expect(result.current.loading).toBe(false));
      const data = { session, user: session.user };
      auth[providerMethod].mockResolvedValueOnce({ data, error: null });

      await expect(
        result.current[method]("person@example.com", "test-password"),
      ).resolves.toEqual(data);
      expect(auth[providerMethod]).toHaveBeenCalledWith({
        email: "person@example.com",
        password: "test-password",
      });
      const error = new Error("Provider rejected credentials");
      auth[providerMethod].mockResolvedValueOnce({ data: null, error });
      await expect(
        result.current[method]("person@example.com", "test-password"),
      ).rejects.toBe(error);
    },
  );

  it("propagates sign-out failures so callers do not report success", async () => {
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    const error = new Error("Sign-out failed");
    auth.signOut.mockResolvedValueOnce({ error });
    await expect(result.current.signOut()).rejects.toBe(error);
    auth.signOut.mockResolvedValueOnce({ error: null });
    await expect(result.current.signOut()).resolves.toBeUndefined();
  });
});
