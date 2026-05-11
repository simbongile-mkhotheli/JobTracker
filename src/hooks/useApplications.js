import { useEffect, useState } from "react";
import { mockApplications } from "../data/mockApplications";
import { applicationService } from "../services/applicationService";

export function useApplications() {
  const [applications, setApplications] = useState(() => {
    const storedApplications =
      applicationService.getApplications();

    return storedApplications.length > 0
      ? storedApplications
      : mockApplications;
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
      currentApplications.filter(
        (application) => application.id !== id
      )
    );
  }

  return {
    applications,
    addApplication,
    deleteApplication,
  };
}