import { useEffect, useState } from "react";
import { seedApplications } from "../data/seedApplications";
import { applicationService } from "../services/applicationService";

export function useApplications() {
  const [applications, setApplications] = useState(() => {
    const storedApplications = applicationService.getApplications();

    return storedApplications.length > 0
      ? storedApplications
      : seedApplications;
  });

  useEffect(() => {
    applicationService.saveApplications(applications);
  }, [applications]);

  function addApplication(application) {
    const newApplication = {
      ...application,
      id: Date.now(),
    };

    setApplications((currentApplications) => [
      ...currentApplications,
      newApplication,
    ]);
  }

  function deleteApplication(id) {
    setApplications((currentApplications) =>
      currentApplications.filter((application) => application.id !== id),
    );
  }

  function updateApplication(updatedApplication) {
    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === updatedApplication.id
          ? updatedApplication
          : application,
      ),
    );
  }

  return {
    applications,
    addApplication,
    deleteApplication,
    updateApplication,
  };
}
