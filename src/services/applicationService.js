import { supabase } from "../lib/supabase";

async function getAllApplications() {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function createApplication(application) {
  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        company: application.company,
        role: application.role,
        website: application.website,
        logoUrl: application.logoUrl,
        dateApplied: application.dateApplied,
        status: application.status,
        notes: application.notes,
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
  const { id, ...updateData } = updatedApplication;
  const { data, error } = await supabase
    .from("applications")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function deleteApplication(id) {
  const { error } = await supabase.from("applications").delete().eq("id", id);

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
