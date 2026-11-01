import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Signup from "../Signup";

const { signUp } = vi.hoisted(() => ({ signUp: vi.fn() }));
vi.mock("../../hooks/useAuth", () => ({ useAuth: () => ({ signUp }) }));

function renderSignup() {
  render(
    <MemoryRouter initialEntries={["/signup"]}>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<div>Private dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "person@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "test-password" },
  });
}

describe("Signup", () => {
  beforeEach(() => {
    signUp.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("does not create an account when the email field is invalid", () => {
    renderSignup();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(screen.getByLabelText("Email")).toBeInvalid();
    expect(signUp).not.toHaveBeenCalled();
  });

  it("opens the dashboard when signup immediately creates a session", async () => {
    signUp.mockResolvedValue({ session: { user: { id: "new-user" } } });
    renderSignup();
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Sign up" })),
    );

    expect(signUp).toHaveBeenCalledWith("person@example.com", "test-password");
    expect(screen.getByText("Private dashboard")).toBeInTheDocument();
  });

  it("asks for email confirmation without granting access when no session is returned", async () => {
    signUp.mockResolvedValue({ session: null });
    renderSignup();
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Sign up" })),
    );

    expect(
      screen.getByText(
        "Account created. Check your email to confirm your signup.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
  });

  it("shows weak-password feedback and clears the error after a successful retry", async () => {
    signUp
      .mockRejectedValueOnce({
        code: "weak_password",
        message: "Provider details",
      })
      .mockResolvedValueOnce({ session: null });
    renderSignup();
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Sign up" })),
    );
    expect(
      screen.getByText("Password must be at least 6 characters."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue("person@example.com");
    expect(console.error).not.toHaveBeenCalled();

    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Sign up" })),
    );
    expect(
      screen.queryByText("Password must be at least 6 characters."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Account created. Check your email to confirm your signup.",
      ),
    ).toBeInTheDocument();
  });

  it("prevents duplicate submissions while pending and restores the form after unexpected failure", async () => {
    let rejectSignup;
    signUp.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectSignup = reject;
      }),
    );
    renderSignup();
    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));
    const pending = screen.getByRole("button", { name: "Creating account..." });
    expect(pending).toBeDisabled();
    fireEvent.click(pending);
    expect(signUp).toHaveBeenCalledTimes(1);
    await act(async () => rejectSignup(new Error("Internal database failure")));

    expect(screen.getByRole("button", { name: "Sign up" })).toBeEnabled();
    expect(
      screen.getByText("We couldn't create your account. Please try again."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Internal database failure"),
    ).not.toBeInTheDocument();
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
