import { beforeEach, describe, expect, it, vi } from "vitest";

const { authGetUserMock, fromMock } = vi.hoisted(() => ({
  authGetUserMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: authGetUserMock,
    },
    from: fromMock,
  },
}));

import { applicationService } from "../applicationService";

const authenticatedUserId = "user-123";

const ownedApplication = {
  id: 1,
  company: "Boxfusion",
  role: "Frontend Developer",
  website: "boxfusion.io",
  logoUrl: "https://www.google.com/s2/favicons?domain=boxfusion.io&sz=128",
  dateApplied: "2026-05-01",
  status: "Interview",
  notes: "Reached recruiter screening stage.",
};

const secondOwnedApplication = {
  id: 2,
  company: "OfferZen",
  role: "UI Engineer",
  website: "offerzen.com",
  logoUrl: "https://www.google.com/s2/favicons?domain=offerzen.com&sz=128",
  dateApplied: "2026-04-28",
  status: "Applied",
  notes: "Applied through careers portal.",
};

const newApplication = {
  company: "MIP Holdings",
  role: "Software Developer",
  website: "mip.co.za",
  logoUrl: "https://www.google.com/s2/favicons?domain=mip.co.za&sz=128",
  dateApplied: "2026-04-10",
  status: "Applied",
  notes: "Application submitted online.",
};

const updatedApplication = {
  ...ownedApplication,
  role: "Senior Frontend Developer",
  status: "Offer",
};

function toDbRow(application, overrides = {}) {
  return {
    id: application.id,
    company: application.company,
    role: application.role,
    website: application.website,
    logo_url: application.logoUrl,
    date_applied: application.dateApplied,
    status: application.status,
    notes: application.notes,
    user_id: authenticatedUserId,
    created_at: "2026-06-16T00:00:00.000Z",
    ...overrides,
  };
}

function mockAuthenticatedUser(userId = authenticatedUserId) {
  authGetUserMock.mockResolvedValueOnce({
    data: { user: { id: userId } },
    error: null,
  });
}

function mockUnauthenticatedUser() {
  authGetUserMock.mockResolvedValueOnce({
    data: { user: null },
    error: null,
  });
}

function mockGetAllApplications(applications) {
  const orderMock = vi.fn().mockResolvedValueOnce({
    data: applications,
    error: null,
  });

  const eqMock = vi.fn().mockReturnValueOnce({
    order: orderMock,
  });

  const selectMock = vi.fn().mockReturnValueOnce({
    eq: eqMock,
  });

  fromMock.mockReturnValueOnce({
    select: selectMock,
  });
}

function mockCreateApplication(createdApplication) {
  const singleMock = vi.fn().mockResolvedValueOnce({
    data: createdApplication,
    error: null,
  });

  const selectMock = vi.fn().mockReturnValueOnce({
    single: singleMock,
  });

  const insertMock = vi.fn().mockReturnValueOnce({
    select: selectMock,
  });

  fromMock.mockReturnValueOnce({
    insert: insertMock,
  });

  return { insertMock };
}

function mockOwnershipCheck({ exists = true, applicationId = 1 }) {
  const ownershipResult = {
    data: exists ? [{ id: applicationId }] : [],
    error: null,
  };

  const userEqMock = vi.fn().mockResolvedValueOnce(ownershipResult);

  const idEqMock = vi.fn().mockReturnValueOnce({
    eq: userEqMock,
  });

  const selectMock = vi.fn().mockReturnValueOnce({
    eq: idEqMock,
  });

  fromMock.mockReturnValueOnce({
    select: selectMock,
  });
}

function mockUpdateApplication(savedApplication) {
  const singleMock = vi.fn().mockResolvedValueOnce({
    data: savedApplication,
    error: null,
  });

  const selectMock = vi.fn().mockReturnValueOnce({
    single: singleMock,
  });

  const userEqMock = vi.fn().mockReturnValueOnce({
    select: selectMock,
  });

  const idEqMock = vi.fn().mockReturnValueOnce({
    eq: userEqMock,
  });

  const updateMock = vi.fn().mockReturnValueOnce({
    eq: idEqMock,
  });

  fromMock.mockReturnValueOnce({
    update: updateMock,
  });

  return { updateMock };
}

function mockDeleteApplication() {
  const deleteResultMock = vi.fn().mockResolvedValueOnce({
    error: null,
  });

  const userEqMock = vi.fn().mockReturnValueOnce({
    eq: deleteResultMock,
  });

  const idEqMock = vi.fn().mockReturnValueOnce({
    eq: userEqMock,
  });

  const deleteMock = vi.fn().mockReturnValueOnce({
    eq: idEqMock,
  });

  fromMock.mockReturnValueOnce({
    delete: deleteMock,
  });

  return { deleteMock };
}

describe("applicationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns applications for the authenticated user", async () => {
    mockAuthenticatedUser();
    mockGetAllApplications([
      toDbRow(ownedApplication),
      toDbRow(secondOwnedApplication),
    ]);

    const result = await applicationService.getAllApplications();

    expect(result).toEqual([
      expect.objectContaining(ownedApplication),
      expect.objectContaining(secondOwnedApplication),
    ]);
  });

  it("throws when the user is not authenticated", async () => {
    mockUnauthenticatedUser();

    await expect(applicationService.getAllApplications()).rejects.toThrow(
      "User is not authenticated.",
    );
  });

  it("creates a new application for the authenticated user", async () => {
    mockAuthenticatedUser();

    const createdApplication = toDbRow({
      id: 3,
      ...newApplication,
    });

    const { insertMock } = mockCreateApplication(createdApplication);

    const result = await applicationService.createApplication(newApplication);

    expect(result).toMatchObject(newApplication);

    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        company: "MIP Holdings",
        role: "Software Developer",
        user_id: authenticatedUserId,
      }),
    ]);
  });

  it("rejects creating an application when the user is not authenticated", async () => {
    mockUnauthenticatedUser();

    await expect(
      applicationService.createApplication(newApplication),
    ).rejects.toThrow("User is not authenticated.");
  });

  it("updates only the authenticated user's application", async () => {
    mockAuthenticatedUser();
    mockOwnershipCheck({
      exists: true,
      applicationId: ownedApplication.id,
    });

    const savedApplication = toDbRow(updatedApplication);

    mockUpdateApplication(savedApplication);

    const result =
      await applicationService.updateApplication(updatedApplication);

    expect(result).toMatchObject({
      id: ownedApplication.id,
      role: "Senior Frontend Developer",
      status: "Offer",
    });
  });

  it("rejects updating an application that the user does not own", async () => {
    mockAuthenticatedUser();
    mockOwnershipCheck({
      exists: false,
      applicationId: ownedApplication.id,
    });

    await expect(
      applicationService.updateApplication(updatedApplication),
    ).rejects.toThrow("Application not found or access denied.");
  });

  it("deletes only the authenticated user's application", async () => {
    mockAuthenticatedUser();
    mockOwnershipCheck({
      exists: true,
      applicationId: ownedApplication.id,
    });

    const { deleteMock } = mockDeleteApplication();

    await applicationService.deleteApplication(ownedApplication.id);

    expect(deleteMock).toHaveBeenCalledTimes(1);
  });

  it("rejects deleting an application that the user does not own", async () => {
    mockAuthenticatedUser();
    mockOwnershipCheck({
      exists: false,
      applicationId: ownedApplication.id,
    });

    await expect(
      applicationService.deleteApplication(ownedApplication.id),
    ).rejects.toThrow("Application not found or access denied.");
  });
});
