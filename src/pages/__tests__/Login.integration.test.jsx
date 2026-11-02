import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Sidebar } from "../../components/Sidebar";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { AuthProvider } from "../../contexts/AuthProvider";
import Login from "../Login";

const { auth } = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
}));

vi.mock("../../lib/supabase", () => ({ supabase: { auth } }));

describe("Login sign-out regression", () => {
  let onAuthChange;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    auth.onAuthStateChange.mockImplementation((callback) => {
      onAuthChange = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    auth.signInWithPassword.mockImplementation(async ({ email }) => {
      const session = { user: { id: "signed-in-user", email } };
      onAuthChange("SIGNED_IN", session);
      return { data: { session, user: session.user }, error: null };
    });
    auth.signOut.mockImplementation(async () => {
      onAuthChange("SIGNED_OUT", null);
      return { error: null };
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each(["Sign in", "Try Demo"])(
    "stays on login after signing out from %s until another explicit login",
    async (buttonName) => {
      await act(async () =>
        render(
          <AuthProvider>
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Sidebar />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </MemoryRouter>
          </AuthProvider>,
        ),
      );
      expect(
        screen.getByRole("heading", { name: "Welcome back" }),
      ).toBeInTheDocument();
      await act(async () => vi.advanceTimersByTime(60_000));
      expect(auth.signInWithPassword).not.toHaveBeenCalled();

      if (buttonName === "Sign in") {
        fireEvent.change(screen.getByLabelText("Email"), {
          target: { value: "person@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Password"), {
          target: { value: "test-password" },
        });
      }
      await act(async () =>
        fireEvent.click(screen.getByRole("button", { name: buttonName })),
      );
      expect(auth.signInWithPassword).toHaveBeenCalledTimes(1);
      expect(
        screen.getByRole("button", { name: "Sign out" }),
      ).toBeInTheDocument();

      await act(async () =>
        fireEvent.click(screen.getByRole("button", { name: "Sign out" })),
      );
      expect(auth.signOut).toHaveBeenCalledTimes(1);
      await act(async () => vi.advanceTimersByTime(800));
      await act(async () => vi.advanceTimersByTime(60_000));
      expect(auth.signInWithPassword).toHaveBeenCalledTimes(1);
      expect(
        screen.getByRole("heading", { name: "Welcome back" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Sign out" }),
      ).not.toBeInTheDocument();

      await act(async () =>
        fireEvent.click(screen.getByRole("button", { name: "Try Demo" })),
      );
      expect(auth.signInWithPassword).toHaveBeenCalledTimes(2);
      expect(auth.signInWithPassword).toHaveBeenLastCalledWith({
        email: "admin@admin.com",
        password: "123456",
      });
      expect(
        screen.getByRole("button", { name: "Sign out" }),
      ).toBeInTheDocument();
    },
  );
});
