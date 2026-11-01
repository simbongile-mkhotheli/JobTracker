import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Login from "../Login";

const { signIn } = vi.hoisted(() => ({ signIn: vi.fn() }));
vi.mock("../../hooks/useAuth", () => ({ useAuth: () => ({ signIn }) }));

function renderLogin() {
  render(
    <MemoryRouter
      initialEntries={[
        { pathname: "/login", state: { from: { pathname: "/applications" } } },
      ]}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/applications"
          element={<div>Requested applications page</div>}
        />
      </Routes>
    </MemoryRouter>,
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

  it("starts demo sign-in after the delay and cancels it on unmount", async () => {
    signIn.mockResolvedValue({});
    renderLogin();
    expect(signIn).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTime(800));
    expect(signIn).toHaveBeenCalledWith("admin@admin.com", "123456");
    expect(screen.getByText("Requested applications page")).toBeInTheDocument();

    cleanup();
    signIn.mockClear();
    renderLogin();
    cleanup();
    await act(async () => vi.advanceTimersByTime(800));
    expect(signIn).not.toHaveBeenCalled();
  });
});
