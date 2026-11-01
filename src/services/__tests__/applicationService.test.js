import { beforeEach, describe, expect, it, vi } from "vitest";

const { authGetUserMock, fromMock } = vi.hoisted(() => ({
  authGetUserMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock("../../lib/supabase", () => ({
  supabase: { auth: { getUser: authGetUserMock }, from: fromMock },
}));

import {
  ApplicationServiceError,
  applicationService,
} from "../applicationService";

const userId = "user-123";
const application = {
  company: "Boxfusion",
  role: "Frontend Developer",
  website: "boxfusion.io",
  logoUrl: "https://boxfusion.io/logo.png",
  dateApplied: "2026-05-01",
  status: "Interview",
  notes: "Recruiter screen scheduled.",
};
const dbPayload = {
  company: application.company,
  role: application.role,
  website: application.website,
  logo_url: application.logoUrl,
  date_applied: application.dateApplied,
  status: application.status,
  notes: application.notes,
};
const dbRow = {
  ...dbPayload,
  id: 7,
  user_id: userId,
  created_at: "2026-06-16T00:00:00.000Z",
};
const savedApplication = {
  ...application,
  id: dbRow.id,
  user_id: userId,
  created_at: dbRow.created_at,
};
const databaseError = {
  message: "Database request denied.",
  code: "42501",
  details: "Insufficient privilege.",
  hint: "Check the application owner.",
};

// Model the SDK's awaitable query builder, including filters before a response.
// These tests verify the client request contract, not database RLS policies.
function mockQuery(data, error = null) {
  const response = Promise.resolve({ data, error });
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    single: vi.fn(),
    then: response.then.bind(response),
  };
  for (const method of [
    "select",
    "eq",
    "order",
    "insert",
    "update",
    "delete",
    "single",
  ]) {
    query[method].mockReturnValue(query);
  }
  fromMock.mockReturnValueOnce(query);
  return query;
}

const operations = [
  ["read", () => applicationService.getAllApplications()],
  ["create", () => applicationService.createApplication(application)],
  [
    "update",
    () => applicationService.updateApplication({ ...application, id: 7 }),
  ],
  ["delete", () => applicationService.deleteApplication(7)],
];

describe("applicationService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authGetUserMock.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });
  });

  it("loads and maps the authenticated user's rows in newest-first order", async () => {
    const query = mockQuery([dbRow]);
    await expect(applicationService.getAllApplications()).resolves.toEqual([
      savedApplication,
    ]);
    expect(fromMock).toHaveBeenCalledWith("applications");
    expect(query.eq).toHaveBeenCalledWith("user_id", userId);
    expect(query.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });

  it("maps nullable optional database columns to empty form values", async () => {
    mockQuery([
      {
        ...dbRow,
        website: null,
        logo_url: null,
        date_applied: null,
        notes: null,
      },
    ]);
    await expect(applicationService.getAllApplications()).resolves.toEqual([
      {
        ...savedApplication,
        website: "",
        logoUrl: "",
        dateApplied: "",
        notes: "",
      },
    ]);
  });

  it.each([{ data: [] }, { data: null }])(
    "returns an empty list for an empty response (%j)",
    async ({ data }) => {
      mockQuery(data);
      await expect(applicationService.getAllApplications()).resolves.toEqual(
        [],
      );
    },
  );

  it.each(operations)(
    "rejects %s without querying the database when signed out",
    async (_name, run) => {
      authGetUserMock.mockResolvedValue({ data: { user: null }, error: null });
      await expect(run()).rejects.toThrow("User is not authenticated.");
      expect(fromMock).not.toHaveBeenCalled();
    },
  );

  it.each(operations)(
    "preserves auth errors and prevents a %s database request",
    async (_name, run) => {
      authGetUserMock.mockResolvedValue({
        data: { user: null },
        error: databaseError,
      });
      await expect(run()).rejects.toMatchObject({
        name: "ApplicationServiceError",
        operation: "getCurrentUser",
        code: databaseError.code,
        originalError: databaseError,
      });
      expect(fromMock).not.toHaveBeenCalled();
    },
  );

  it("creates a row owned by the authenticated user and maps its saved values", async () => {
    const query = mockQuery(dbRow);
    await expect(
      applicationService.createApplication(application),
    ).resolves.toEqual(savedApplication);
    expect(query.insert).toHaveBeenCalledWith([
      { ...dbPayload, user_id: userId },
    ]);
    expect(query.single).toHaveBeenCalledOnce();
  });

  it("updates an owned row using both id and user filters without changing ownership", async () => {
    const ownershipQuery = mockQuery([{ id: 7 }]);
    const query = mockQuery({ ...dbRow, status: "Offer" });
    await expect(
      applicationService.updateApplication({
        ...application,
        id: 7,
        status: "Offer",
      }),
    ).resolves.toMatchObject({ id: 7, status: "Offer" });
    for (const request of [ownershipQuery, query]) {
      expect(request.eq).toHaveBeenCalledWith("id", 7);
      expect(request.eq).toHaveBeenCalledWith("user_id", userId);
    }
    expect(query.update).toHaveBeenCalledWith({
      ...dbPayload,
      status: "Offer",
    });
  });

  it("deletes an owned row using both id and user filters", async () => {
    const ownershipQuery = mockQuery([{ id: 7 }]);
    const query = mockQuery(null);
    await expect(
      applicationService.deleteApplication(7),
    ).resolves.toBeUndefined();
    expect(query.delete).toHaveBeenCalledOnce();
    for (const request of [ownershipQuery, query]) {
      expect(request.eq).toHaveBeenCalledWith("id", 7);
      expect(request.eq).toHaveBeenCalledWith("user_id", userId);
    }
  });

  it.each(operations.slice(2))(
    "does not %s a missing or inaccessible row",
    async (_name, run) => {
      const ownershipQuery = mockQuery([]);
      await expect(run()).rejects.toThrow(
        "Application not found or access denied.",
      );
      expect(fromMock).toHaveBeenCalledTimes(1);
      expect(ownershipQuery.update).not.toHaveBeenCalled();
      expect(ownershipQuery.delete).not.toHaveBeenCalled();
    },
  );

  it.each(operations.slice(2))(
    "does not %s when the ownership lookup fails",
    async (_name, run) => {
      mockQuery(null, databaseError);
      await expect(run()).rejects.toMatchObject({
        operation: "ensureApplicationOwnership",
        applicationId: 7,
        code: databaseError.code,
        originalError: databaseError,
      });
      expect(fromMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    ["getAllApplications", operations[0][1]],
    ["createApplication", operations[1][1]],
    ["updateApplication", operations[2][1]],
    ["deleteApplication", operations[3][1]],
  ])("preserves diagnostic context when %s fails", async (operation, run) => {
    if (
      operation === "updateApplication" ||
      operation === "deleteApplication"
    ) {
      mockQuery([{ id: 7 }]);
    }
    mockQuery(null, databaseError);
    const error = await run().catch((error) => error);
    expect(error).toBeInstanceOf(ApplicationServiceError);
    expect(error).toMatchObject({
      operation,
      message: databaseError.message,
      code: databaseError.code,
      details: databaseError.details,
      hint: databaseError.hint,
      originalError: databaseError,
    });
    if (
      operation === "updateApplication" ||
      operation === "deleteApplication"
    ) {
      expect(error.applicationId).toBe(7);
    }
  });

  it("rejects an update when the saved row is no longer visible", async () => {
    mockQuery([{ id: 7 }]);
    mockQuery(null, {
      message: "Cannot coerce the result to a single JSON object",
      code: "PGRST116",
    });
    await expect(
      applicationService.updateApplication({ ...application, id: 7 }),
    ).rejects.toMatchObject({
      operation: "updateApplication",
      applicationId: 7,
      code: "PGRST116",
    });
  });

  it("propagates a transport rejection instead of returning a successful read", async () => {
    const error = new Error("Network unavailable");
    const query = mockQuery(null);
    query.order.mockRejectedValueOnce(error);
    await expect(applicationService.getAllApplications()).rejects.toBe(error);
  });
});
