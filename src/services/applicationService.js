const STORAGE_KEY = "applicationhub_applications";

function getApplications() {
  const storedApplications = localStorage.getItem(STORAGE_KEY);

  return storedApplications
    ? JSON.parse(storedApplications)
    : [];
}

function saveApplications(applications) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(applications)
  );
}

export const applicationService = {
  getApplications,
  saveApplications,
};