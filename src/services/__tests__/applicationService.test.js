import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  fromMock,
  selectMock,
  insertMock,
  updateMock,
  deleteMock,
  orderMock,
  eqMock,
  singleMock,
} = vi.hoisted(() => ({
  fromMock: vi.fn(),
  selectMock: vi.fn(),
  insertMock: vi.fn(),
  updateMock: vi.fn(),
  deleteMock: vi.fn(),
  orderMock: vi.fn(),
  eqMock: vi.fn(),
  singleMock: vi.fn(),
}));

vi.mock("../../lib/supabase", () => ({
  supabase: {
    from: fromMock,
  },
}));

import { applicationService } from "../applicationService";

const existingApplication = {
  id: 1,
  company: "Google",
  role: "Frontend Developer",
  website: "google.com",
  logoUrl: "https://www.google.com/s2/favicons?domain=google.com&sz=128",
  dateApplied: "2026-05-01",
  status: "Interview",
  notes: "Reached recruiter screening stage.",
};

const newApplication = {
  company: "Google",
  role: "Software Developer",
  website: "google.com",
  logoUrl: "https://www.google.com/s2/favicons?domain=google.com&sz=128",
  dateApplied: "2026-04-10",
  status: "Applied",
  notes: "Application submitted online.",
};

describe("applicationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    fromMock.mockReturnValue({
      select: selectMock,
      insert: insertMock,
      update: updateMock,
      delete: deleteMock,
    });

    selectMock.mockReset();
    insertMock.mockReset();
    updateMock.mockReset();
    deleteMock.mockReset();
    eqMock.mockReset();
    orderMock.mockReset();
    singleMock.mockReset();
  });

  it("returns applications from Supabase", async () => {
    orderMock.mockResolvedValueOnce({
      data: [existingApplication],
      error: null,
    });

    selectMock.mockReturnValueOnce({
      order: orderMock,
    });

    const result = await applicationService.getAllApplications();

    expect(result).toEqual([existingApplication]);
  });

  it("creates a new application in Supabase", async () => {
    const insertedApplication = {
      id: 3,
      ...newApplication,
    };

    singleMock.mockResolvedValueOnce({
      data: insertedApplication,
      error: null,
    });

    selectMock.mockReturnValueOnce({
      single: singleMock,
    });

    insertMock.mockReturnValueOnce({
      select: selectMock,
    });

    const result = await applicationService.createApplication(newApplication);

    expect(result).toMatchObject(newApplication);
  });

  it("updates an existing application in Supabase", async () => {
    const updatedApplication = {
      ...existingApplication,
      role: "Senior Frontend Developer",
      status: "Offer",
    };

    singleMock.mockResolvedValueOnce({
      data: updatedApplication,
      error: null,
    });

    selectMock.mockReturnValueOnce({
      single: singleMock,
    });

    eqMock.mockReturnValueOnce({
      select: selectMock,
    });

    updateMock.mockReturnValueOnce({
      eq: eqMock,
    });

    const result =
      await applicationService.updateApplication(updatedApplication);

    expect(result).toMatchObject({
      role: "Senior Frontend Developer",
      status: "Offer",
    });
  });

  it("deletes an application in Supabase", async () => {
    eqMock.mockResolvedValueOnce({
      error: null,
    });

    deleteMock.mockReturnValueOnce({
      eq: eqMock,
    });

    await applicationService.deleteApplication(existingApplication.id);

    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(eqMock).toHaveBeenCalledWith("id", existingApplication.id);
  });

  it("throws when Supabase returns an error while loading applications", async () => {
    orderMock.mockResolvedValueOnce({
      data: null,
      error: { message: "Failed to load" },
    });

    selectMock.mockReturnValueOnce({
      order: orderMock,
    });

    await expect(applicationService.getAllApplications()).rejects.toThrow(
      "Failed to load",
    );
  });
});
