import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useApplications } from "../useApplications";
import type {
  Application,
  ApplicationUpdate,
  NewApplication,
} from "../../types/application";

const { service } = vi.hoisted(() => ({
  service: {
    getAllApplications: vi.fn<() => Promise<Application[]>>(),
    createApplication:
      vi.fn<(application: NewApplication) => Promise<Application>>(),
    updateApplication:
      vi.fn<(application: ApplicationUpdate) => Promise<Application>>(),
    deleteApplication: vi.fn<(id: number) => Promise<void>>(),
  },
}));

vi.mock("../../services/applicationService", () => ({
  ApplicationServiceError: class ApplicationServiceError extends Error {},
  applicationService: service,
}));

const firstApplication: Application = {
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
};
const secondApplication: Application = {
  ...firstApplication,
  id: 2,
  company: "OfferZen",
  status: "Offer",
};
const initialApplications = [firstApplication, secondApplication];

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

async function renderLoadedHook() {
  const hook = renderHook(() => useApplications());
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  expect(hook.result.current.applications).toEqual(initialApplications);
  return hook;
}

describe("useApplications persistence", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    service.getAllApplications.mockResolvedValue(initialApplications);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps loading visible until the initial read completes, then exposes saved rows and totals", async () => {
    const read = deferred<Application[]>();
    service.getAllApplications.mockReturnValue(read.promise);
    const { result } = renderHook(() => useApplications());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.applications).toEqual([]);
    await act(async () => {
      read.resolve(initialApplications);
      await read.promise;
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.applications).toEqual(initialApplications);
    expect(result.current.stats).toEqual({
      total: 2,
      interviews: 1,
      offers: 1,
      rejected: 0,
    });
  });

  it("clears loading and exposes a safe message when the initial database read rejects", async () => {
    service.getAllApplications.mockRejectedValue(
      new Error("Private database details"),
    );
    const { result } = renderHook(() => useApplications());
    await waitFor(() =>
      expect(result.current.error).toBe("Failed to load applications."),
    );
    expect(result.current.isLoading).toBe(false);
    expect(result.current.applications).toEqual([]);
    expect(result.current.stats.total).toBe(0);
  });

  it("prepends the saved server record only after a create succeeds", async () => {
    const { result } = await renderLoadedHook();
    const write = deferred<Application>();
    const saved = { ...firstApplication, id: 3, company: "Saved company" };
    service.createApplication.mockReturnValue(write.promise);
    let save!: Promise<boolean>;
    act(() => {
      save = result.current.addApplication(firstApplication);
    });
    expect(service.createApplication).toHaveBeenCalledWith(firstApplication);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.applications).toEqual(initialApplications);
    await act(async () => {
      write.resolve(saved);
      expect(await save).toBe(true);
    });
    expect(result.current.applications).toEqual([
      saved,
      ...initialApplications,
    ]);
    expect(result.current.stats.total).toBe(3);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("replaces only the saved application after an update succeeds", async () => {
    const { result } = await renderLoadedHook();
    const saved = {
      ...firstApplication,
      status: "Rejected" as const,
      notes: "Server-saved notes",
    };
    service.updateApplication.mockResolvedValue(saved);
    await act(async () => {
      expect(
        await result.current.updateApplication({
          ...firstApplication,
          status: "Rejected",
        }),
      ).toBe(true);
    });
    expect(service.updateApplication).toHaveBeenCalledWith({
      ...firstApplication,
      status: "Rejected",
    });
    expect(result.current.applications).toEqual([saved, secondApplication]);
    expect(result.current.stats).toEqual({
      total: 2,
      interviews: 0,
      offers: 1,
      rejected: 1,
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("keeps a row until deletion succeeds and then updates its totals", async () => {
    const { result } = await renderLoadedHook();
    const write = deferred<void>();
    service.deleteApplication.mockReturnValue(write.promise);
    let remove!: Promise<boolean>;
    act(() => {
      remove = result.current.deleteApplication(1);
    });
    expect(result.current.applications).toEqual(initialApplications);
    expect(result.current.isLoading).toBe(true);
    await act(async () => {
      write.resolve();
      expect(await remove).toBe(true);
    });
    expect(service.deleteApplication).toHaveBeenCalledWith(1);
    expect(result.current.applications).toEqual([secondApplication]);
    expect(result.current.stats).toEqual({
      total: 1,
      interviews: 0,
      offers: 1,
      rejected: 0,
    });
    expect(result.current.isLoading).toBe(false);
  });

  it.each(["create", "update", "delete"] as const)(
    "returns false and preserves rows and totals after a failed %s",
    async (operation) => {
      const { result } = await renderLoadedHook();
      const error = new Error("Private database details");
      service.createApplication.mockRejectedValue(error);
      service.updateApplication.mockRejectedValue(error);
      service.deleteApplication.mockRejectedValue(error);
      await act(async () => {
        const success =
          operation === "create"
            ? await result.current.addApplication(firstApplication)
            : operation === "update"
              ? await result.current.updateApplication({
                  ...firstApplication,
                  status: "Rejected",
                })
              : await result.current.deleteApplication(1);
        expect(success).toBe(false);
      });
      expect(result.current.applications).toEqual(initialApplications);
      expect(result.current.stats).toEqual({
        total: 2,
        interviews: 1,
        offers: 1,
        rejected: 0,
      });
      expect(result.current.error).toBe(`Failed to ${operation} application.`);
      expect(result.current.isLoading).toBe(false);
    },
  );

  it("clears a failed-save message when a retry starts and accepts the subsequent success", async () => {
    const { result } = await renderLoadedHook();
    service.createApplication.mockRejectedValueOnce(
      new Error("Connection lost"),
    );
    await act(async () => {
      await result.current.addApplication(firstApplication);
    });
    expect(result.current.error).toBe("Failed to create application.");
    const retry = deferred<Application>();
    const saved = { ...firstApplication, id: 3 };
    service.createApplication.mockReturnValueOnce(retry.promise);
    let save!: Promise<boolean>;
    act(() => {
      save = result.current.addApplication(firstApplication);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(true);
    await act(async () => {
      retry.resolve(saved);
      expect(await save).toBe(true);
    });
    expect(result.current.applications).toEqual([
      saved,
      ...initialApplications,
    ]);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
