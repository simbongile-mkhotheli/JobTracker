const STORAGE_KEY = "jobtracker_applications";

function getAllApplications() {
  try {
    const storedApplications =
      localStorage.getItem(STORAGE_KEY);

    if (!storedApplications) {
      return [];
    }

    const parsedApplications =
      JSON.parse(storedApplications);

    return Array.isArray(parsedApplications)
      ? parsedApplications
      : [];
  } catch (error) {
    console.error(
      "Failed to load applications:",
      error,
    );

    return [];
  }
}

function saveApplications(applications) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(applications),
    );
  } catch (error) {
    console.error(
      "Failed to save applications:",
      error,
    );
  }
}

function createApplication(
  applications,
  application,
) {
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