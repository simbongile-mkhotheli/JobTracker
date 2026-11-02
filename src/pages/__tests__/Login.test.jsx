import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { StrictMode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Login from "../Login";

const { signIn } = vi.hoisted(() => ({ signIn: vi.fn() }));
vi.mock("../../hooks/useAuth", () => ({ useAuth: () => ({ signIn }) }));

function renderLogin({ state = { from: { pathname: "/applications" } } } = {}) {
  render(
    <StrictMode>
      <MemoryRouter initialEntries={[{ pathname: "/login", state }]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>Default dashboard</div>} />
          <Route
            path="/applications"
            element={<div>Requested applications page</div>}
          />
        </Routes>
      </MemoryRouter>
    </StrictMode>,
  );
}

function fillCredentials() {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "person@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "test-password" },
  });
}

describe("Login", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    signIn.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("submits credentials and returns the user to the requested protected page", async () => {
    signIn.mockResolvedValue({});
    renderLogin();
    fillCredentials();
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Sign in" })),
    );

    expect(signIn).toHaveBeenCalledWith("person@example.com", "test-password");
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Requested applications page")).toBeInTheDocument();
  });

  it("does not submit credentials when the email field is invalid", () => {
    renderLogin();
    fillCredentials();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByLabelText("Email")).toBeInvalid();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("shows a safe invalid-credentials error and allows a successful retry", async () => {
    signIn
      .mockRejectedValueOnce({
        code: "invalid_credentials",
        message: "Provider details",
      })
      .mockResolvedValueOnce({});
    renderLogin();
    fillCredentials();
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Sign in" })),
    );

    expect(
      screen.getByText("Email or password is incorrect."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Provider details")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue("person@example.com");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    expect(console.error).not.toHaveBeenCalled();
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Sign in" })),
    );
    expect(screen.getByText("Requested applications page")).toBeInTheDocument();
  });

  it("disables sign-in while a request is pending and handles unexpected failures safely", async () => {
    let rejectSignIn;
    signIn.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectSignIn = reject;
      }),
    );
    renderLogin();
    fillCredentials();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    const pending = screen.getByRole("button", { name: "Signing in..." });
    expect(pending).toBeDisabled();
    fireEvent.click(pending);
    expect(signIn).toHaveBeenCalledTimes(1);
    await act(async () => rejectSignIn(new Error("Internal provider failure")));

    expect(
      screen.getByText("We couldn't sign you in. Please try again."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Internal provider failure"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("never authenticates automatically or changes manually entered credentials", async () => {
    signIn.mockResolvedValue({});
    renderLogin();
    await act(async () => vi.advanceTimersByTime(800));
    expect(signIn).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Password")).toHaveValue("");

    fillCredentials();
    await act(async () => vi.advanceTimersByTime(60_000));
    expect(signIn).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Email")).toHaveValue("person@example.com");
    expect(screen.getByLabelText("Password")).toHaveValue("test-password");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Try Demo" })).toBeEnabled();
  });

  it("authenticates the demo account only when Try Demo is clicked", async () => {
    signIn.mockResolvedValue({});
    renderLogin();
    // Demo access must also work with empty required manual-login fields.
    expect(signIn).not.toHaveBeenCalled();
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Try Demo" })),
    );
    expect(signIn).toHaveBeenCalledWith("admin@admin.com", "123456");
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Requested applications page")).toBeInTheDocument();
  });

  it.each(["Sign in", "Try Demo"])(
    "returns to the default dashboard after %s without a requested route",
    async (buttonName) => {
      signIn.mockResolvedValue({});
      renderLogin({ state: null });
      fillCredentials();
      await act(async () =>
        fireEvent.click(screen.getByRole("button", { name: buttonName })),
      );
      expect(screen.getByText("Default dashboard")).toBeInTheDocument();
    },
  );

  it.each(["Sign in", "Try Demo"])(
    "prevents repeated and competing requests while %s is pending",
    async (buttonName) => {
      let resolveSignIn;
      signIn.mockReturnValue(
        new Promise((resolve) => {
          resolveSignIn = resolve;
        }),
      );
      renderLogin();
      fillCredentials();
      const manual = screen.getByRole("button", { name: "Sign in" });
      const demo = screen.getByRole("button", { name: "Try Demo" });
      const first = buttonName === "Sign in" ? manual : demo;
      const form = manual.closest("form");

      // Batch events to cover attempts before disabled state has rendered.
      act(() => {
        fireEvent.click(first);
        fireEvent.click(first);
        fireEvent.click(demo);
        fireEvent.submit(form);
        fireEvent.submit(form);
      });
      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledWith(
        ...(buttonName === "Sign in"
          ? ["person@example.com", "test-password"]
          : ["admin@admin.com", "123456"]),
      );
      expect(manual).toBeDisabled();
      expect(demo).toBeDisabled();
      await act(async () => vi.advanceTimersByTime(60_000));
      expect(signIn).toHaveBeenCalledTimes(1);
      expect(screen.getByLabelText("Email")).toHaveValue("person@example.com");
      expect(screen.getByLabelText("Password")).toHaveValue("test-password");

      await act(async () => resolveSignIn({}));
      expect(
        screen.getByText("Requested applications page"),
      ).toBeInTheDocument();
    },
  );

  it("shows safe demo failure feedback and preserves credentials for a manual retry", async () => {
    signIn
      .mockRejectedValueOnce({
        code: "invalid_credentials",
        message: "Provider details",
      })
      .mockResolvedValueOnce({});
    renderLogin();
    fillCredentials();
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Try Demo" })),
    );

    expect(
      screen.getByText("Email or password is incorrect."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Provider details")).not.toBeInTheDocument();
    expect(console.error).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Email")).toHaveValue("person@example.com");
    expect(screen.getByLabelText("Password")).toHaveValue("test-password");
    expect(screen.getByRole("button", { name: "Try Demo" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    await act(async () => vi.advanceTimersByTime(60_000));
    expect(signIn).toHaveBeenCalledTimes(1);

    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Sign in" })),
    );
    expect(signIn).toHaveBeenLastCalledWith(
      "person@example.com",
      "test-password",
    );
    expect(screen.getByText("Requested applications page")).toBeInTheDocument();
  });
});
