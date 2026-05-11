import { useState } from "react";
import { mockApplications } from "../data/mockApplications";

export function useApplications() {
  const [applications, setApplications] = useState(mockApplications);

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
      currentApplications.filter((application) => application.id !== id)
    );
  }

  return {
    applications,
    addApplication,
    deleteApplication,
  };
}