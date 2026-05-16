import { useMemo, useState } from "react";

import { seedApplications } from "../data/seedApplications";

import { applicationService } from "../services/applicationService";
import { filterApplications } from "../utils/filterApplications";
import { calculateApplicationStats } from "../utils/calculateApplicationStats";

export function useApplications() {
  const [applications, setApplications] = useState(() => {
    const storedApplications = applicationService.getAllApplications();

    return storedApplications.length > 0
      ? storedApplications
      : seedApplications;
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  function addApplication(application) {
    setApplications((currentApplications) =>
      applicationService.createApplication(currentApplications, application),
    );
  }

  function deleteApplication(id) {
    setApplications((currentApplications) =>
      applicationService.deleteApplication(currentApplications, id),
    );
  }

  function updateApplication(updatedApplication) {
    setApplications((currentApplications) =>
      applicationService.updateApplication(
        currentApplications,
        updatedApplication,
      ),
    );
  }

  const filteredApplications = useMemo(() => {
    return filterApplications(applications, searchTerm, statusFilter);
  }, [applications, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return calculateApplicationStats(filteredApplications);
  }, [filteredApplications]);

  return {
    applications: filteredApplications,

    addApplication,

    deleteApplication,

    updateApplication,

    searchTerm,
    setSearchTerm,

    statusFilter,
    setStatusFilter,

    stats,
  };
}
