import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Dashboard from "../Dashboard";
import type {
  Application,
  ApplicationId,
  ApplicationUpdate,
} from "../../types/application";

const { applicationServiceMock, signOutMock } = vi.hoisted(() => ({
  applicationServiceMock: {
    getAllApplications: vi.fn(),
    createApplication: vi.fn(),
    updateApplication: vi.fn(),
    deleteApplication: vi.fn(),
  },
  signOutMock: vi.fn(),
}));

vi.mock("../../services/applicationService", () => ({
  ApplicationServiceError: class ApplicationServiceError extends Error {},
  applicationService: applicationServiceMock,
}));

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    user: { email: "recruiter@example.com" },
    signOut: signOutMock,
  }),
}));

const applications: Application[] = [
  {
    id: 1,
    company: "Boxfusion",
    role: "Frontend Developer",
    website: "boxfusion.io",
    logoUrl: "",
    dateApplied: "2026-05-01",
    status: "Interview",
    notes: "Recruiter screen scheduled.",
    user_id: "user-123",
    created_at: "2026-06-16T00:00:00.000Z",
  },
  {
    id: 2,
    company: "OfferZen",
    role: "UI Engineer",
    website: "offerzen.com",
    logoUrl: "",
    dateApplied: "2026-04-28",
    status: "Offer",
    notes: "Offer received.",
    user_id: "user-123",
    created_at: "2026-06-15T00:00:00.000Z",
  },
  {
    id: 3,
    company: "MIP Holdings",
    role: "Software Developer",
    website: "mip.co.za",
    logoUrl: "",
    dateApplied: "2026-04-10",
    status: "Applied",
    notes: "Applied online.",
    user_id: "user-123",
    created_at: "2026-06-14T00:00:00.000Z",
  },
];

function cloneApplications() {
  return applications.map((application) => ({ ...application }));
}

function getApplication(id: ApplicationId) {
  const application = applications.find((item) => item.id === id);

  if (!application) {
    throw new Error(`Missing test application with id ${id}.`);
  }

  return application;
}

function getStatCard(label: string) {
  const card = screen.getByText(label).closest("article");

  if (!card) {
    throw new Error(`Missing stat card for ${label}.`);
  }

  return within(card);
}

function expectStatValue(label: string, value: string) {
  expect(getStatCard(label).getByText(value)).toBeInTheDocument();
}

function renderDashboard() {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe("Dashboard workflows", () => {
  beforeEach(() => {
    applicationServiceMock.getAllApplications.mockReset();
    applicationServiceMock.createApplication.mockReset();
    applicationServiceMock.updateApplication.mockReset();
    applicationServiceMock.deleteApplication.mockReset();
    signOutMock.mockReset();

    applicationServiceMock.getAllApplications.mockResolvedValue(
      cloneApplications(),
    );
    applicationServiceMock.deleteApplication.mockResolvedValue(undefined);
    applicationServiceMock.updateApplication.mockImplementation(
      (updatedApplication: ApplicationUpdate) =>
        Promise.resolve({
          ...getApplication(updatedApplication.id),
          ...updatedApplication,
        }),
    );
  });

  it("keeps dashboard stats account-wide while filtering the grid", async () => {
    const user = userEvent.setup();

    renderDashboard();

    await screen.findByText("Boxfusion");

    expectStatValue("Total Applications", "3");
    expectStatValue("Interviews", "1");
    expectStatValue("Offers", "1");
    expectStatValue("Rejections", "0");

    await user.type(
      screen.getByPlaceholderText("Search company or role..."),
      "OfferZen",
    );

    expect(screen.getByText("OfferZen")).toBeInTheDocument();
    expect(screen.queryByText("Boxfusion")).not.toBeInTheDocument();
    expect(screen.queryByText("MIP Holdings")).not.toBeInTheDocument();

    expectStatValue("Total Applications", "3");
    expectStatValue("Interviews", "1");
    expectStatValue("Offers", "1");
    expectStatValue("Rejections", "0");

    await user.clear(screen.getByPlaceholderText("Search company or role..."));
    await user.selectOptions(screen.getByRole("combobox"), "Applied");

    expect(screen.getByText("MIP Holdings")).toBeInTheDocument();
    expect(screen.queryByText("Boxfusion")).not.toBeInTheDocument();
    expect(screen.queryByText("OfferZen")).not.toBeInTheDocument();

    expectStatValue("Total Applications", "3");
    expectStatValue("Interviews", "1");
    expectStatValue("Offers", "1");
    expectStatValue("Rejections", "0");
  });

  it("removes a deleted application from the grid and updates stats", async () => {
    const user = userEvent.setup();

    renderDashboard();

    await screen.findByText("Boxfusion");

    await user.click(screen.getByRole("button", { name: "Delete Boxfusion" }));
    await user.click(screen.getByRole("button", { name: "Confirm Delete" }));

    await waitFor(() => {
      expect(applicationServiceMock.deleteApplication).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(screen.queryByText("Boxfusion")).not.toBeInTheDocument();
    });

    expect(screen.getByText("OfferZen")).toBeInTheDocument();
    expect(screen.getByText("MIP Holdings")).toBeInTheDocument();
    expectStatValue("Total Applications", "2");
    expectStatValue("Interviews", "0");
    expectStatValue("Offers", "1");
  });

  it("updates an edited application in the grid and stats", async () => {
    const user = userEvent.setup();

    renderDashboard();

    await screen.findByText("Boxfusion");

    await user.click(screen.getByRole("button", { name: "Edit Boxfusion" }));
    await user.clear(screen.getByLabelText("Role"));
    await user.type(screen.getByLabelText("Role"), "Senior Frontend Developer");
    await user.selectOptions(screen.getByLabelText("Status"), "Offer");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(applicationServiceMock.updateApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          role: "Senior Frontend Developer",
          status: "Offer",
        }),
      );
    });

    expect(
      await screen.findByText("Senior Frontend Developer"),
    ).toBeInTheDocument();
    expectStatValue("Interviews", "0");
    expectStatValue("Offers", "2");
  });
});
