import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProtectedRoute } from "../ProtectedRoute";

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}));

vi.mock("../../../hooks/useAuth", () => ({
  useAuth: useAuthMock,
}));

function renderProtectedRoute() {
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Private dashboard</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("shows a loading state while auth is being resolved", () => {
    useAuthMock.mockReturnValue({
      user: null,
      loading: true,
    });

    renderProtectedRoute();

    expect(screen.getByText("Loading session...")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    useAuthMock.mockReturnValue({
      user: null,
      loading: false,
    });

    renderProtectedRoute();

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    useAuthMock.mockReturnValue({
      user: { email: "recruiter@example.com" },
      loading: false,
    });

    renderProtectedRoute();

    expect(screen.getByText("Private dashboard")).toBeInTheDocument();
  });
});
