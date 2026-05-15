const STORAGE_KEY = "jobtracker_applications";

function getAllApplications() {
  const storedApplications =
    localStorage.getItem(STORAGE_KEY);

  return storedApplications
    ? JSON.parse(storedApplications)
    : [];
}

function saveApplications(applications) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(applications),
  );
}

function createApplication(applications, application) {
  const updatedApplications = [
    ...applications,
    {
      ...application,
      id: Date.now(),
    },
  ];

  saveApplications(updatedApplications);

  return updatedApplications;
}

function updateApplication(
  applications,
  updatedApplication,
) {
  const updatedApplications = applications.map(
    (application) =>
      application.id === updatedApplication.id
        ? updatedApplication
        : application,
  );

  saveApplications(updatedApplications);

  return updatedApplications;
}

function deleteApplication(applications, id) {
  const updatedApplications = applications.filter(
    (application) => application.id !== id,
  );

  saveApplications(updatedApplications);

  return updatedApplications;
}

export const applicationService = {
  getAllApplications,
  createApplication,
  updateApplication,
  deleteApplication,
};