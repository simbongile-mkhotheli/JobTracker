import { supabase } from "../lib/supabase";

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  const userId = data.user?.id;

  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  return userId;
}

function toApplicationPayload(application) {
  return {
    company: application.company,
    role: application.role,
    website: application.website,
    logoUrl: application.logoUrl,
    dateApplied: application.dateApplied,
    status: application.status,
    notes: application.notes,
  };
}

async function ensureApplicationOwnership(id, userId) {
  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Application not found or access denied.");
  }
}

async function getAllApplications() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function createApplication(application) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        ...toApplicationPayload(application),
        user_id: userId,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function updateApplication(updatedApplication) {
  const userId = await getCurrentUserId();

  await ensureApplicationOwnership(updatedApplication.id, userId);

  const { data, error } = await supabase
    .from("applications")
    .update(toApplicationPayload(updatedApplication))
    .eq("id", updatedApplication.id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function deleteApplication(id) {
  const userId = await getCurrentUserId();

  await ensureApplicationOwnership(id, userId);

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export const applicationService = {
  getAllApplications,
  createApplication,
  updateApplication,
  deleteApplication,
};