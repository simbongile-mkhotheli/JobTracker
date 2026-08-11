import { supabase } from "../lib/supabase";
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import type {
  Application,
  ApplicationDbPayload,
  ApplicationId,
  ApplicationRow,
  ApplicationUpdate,
  NewApplication,
} from "../types/application";

type ApplicationServiceOperation =
  | "getCurrentUser"
  | "ensureApplicationOwnership"
  | "getAllApplications"
  | "createApplication"
  | "updateApplication"
  | "deleteApplication";

type ApplicationServiceErrorContext = {
  operation: ApplicationServiceOperation;
  applicationId?: ApplicationId;
};

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

export class ApplicationServiceError extends Error {
  readonly code?: string;
  readonly details?: string;
  readonly hint?: string;
  readonly operation: ApplicationServiceOperation;
  readonly applicationId?: ApplicationId;
  readonly originalError: unknown;

  constructor(
    error: SupabaseErrorLike,
    context: ApplicationServiceErrorContext,
  ) {
    super(error.message || "Application service request failed.");
    this.name = "ApplicationServiceError";
    this.code = error.code;
    this.details = error.details;
    this.hint = error.hint;
    this.operation = context.operation;
    this.applicationId = context.applicationId;
    this.originalError = error;
  }
}

function throwSupabaseError(
  error: SupabaseErrorLike,
  context: ApplicationServiceErrorContext,
): never {
  throw new ApplicationServiceError(error, context);
}

function toDbPayload(
  application: NewApplication | ApplicationUpdate,
): ApplicationDbPayload {
  return {
    company: application.company,
    role: application.role,
    website: application.website,
    logo_url: application.logoUrl,
    date_applied: application.dateApplied,
    status: application.status,
    notes: application.notes,
  };
}

function toAppModel(row: ApplicationRow): Application {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    website: row.website ?? "",
    logoUrl: row.logo_url ?? "",
    dateApplied: row.date_applied ?? "",
    status: row.status,
    notes: row.notes ?? "",
    user_id: row.user_id,
    created_at: row.created_at,
  };
}

function asPostgrestResponse<T>(response: unknown): PostgrestResponse<T> {
  return response as PostgrestResponse<T>;
}

function asPostgrestSingleResponse<T>(
  response: unknown,
): PostgrestSingleResponse<T> {
  return response as PostgrestSingleResponse<T>;
}

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throwSupabaseError(error, { operation: "getCurrentUser" });
  }

  const userId = data.user?.id;

  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  return userId;
}

async function ensureApplicationOwnership(
  id: ApplicationId,
  userId: string,
): Promise<void> {
  const { data, error } = asPostgrestResponse<Pick<ApplicationRow, "id">>(
    await supabase
      .from("applications")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId),
  );

  if (error) {
    throwSupabaseError(error, {
      operation: "ensureApplicationOwnership",
      applicationId: id,
    });
  }

  if (!data || data.length === 0) {
    throw new Error("Application not found or access denied.");
  }
}

async function getAllApplications(): Promise<Application[]> {
  const userId = await getCurrentUserId();

  const { data, error } = asPostgrestResponse<ApplicationRow>(
    await supabase
      .from("applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  );

  if (error) {
    throwSupabaseError(error, { operation: "getAllApplications" });
  }

  return (data ?? []).map(toAppModel);
}

async function createApplication(
  application: NewApplication,
): Promise<Application> {
  const userId = await getCurrentUserId();

  const { data, error } = asPostgrestSingleResponse<ApplicationRow>(
    await supabase
      .from("applications")
      .insert([
        {
          ...toDbPayload(application),
          user_id: userId,
        },
      ])
      .select("*")
      .single(),
  );

  if (error) {
    throwSupabaseError(error, { operation: "createApplication" });
  }

  return toAppModel(data);
}

async function updateApplication(
  updatedApplication: ApplicationUpdate,
): Promise<Application> {
  const userId = await getCurrentUserId();

  await ensureApplicationOwnership(updatedApplication.id, userId);

  const { data, error } = asPostgrestSingleResponse<ApplicationRow>(
    await supabase
      .from("applications")
      .update(toDbPayload(updatedApplication))
      .eq("id", updatedApplication.id)
      .eq("user_id", userId)
      .select("*")
      .single(),
  );

  if (error) {
    throwSupabaseError(error, {
      operation: "updateApplication",
      applicationId: updatedApplication.id,
    });
  }

  return toAppModel(data);
}

async function deleteApplication(id: ApplicationId): Promise<void> {
  const userId = await getCurrentUserId();

  await ensureApplicationOwnership(id, userId);

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throwSupabaseError(error, {
      operation: "deleteApplication",
      applicationId: id,
    });
  }
}

export const applicationService = {
  getAllApplications,
  createApplication,
  updateApplication,
  deleteApplication,
};
