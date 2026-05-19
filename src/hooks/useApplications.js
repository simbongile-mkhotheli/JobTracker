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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function addApplication(application) {
    try {
      setIsLoading(true);
      setError(null);

      const updatedApplications = applicationService.createApplication(
        applications,
        application,
      );

      setApplications(updatedApplications);
    } catch (error) {
      setError("Failed to create application.");

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteApplication(id) {
    try {
      setIsLoading(true);
      setError(null);

      const updatedApplications = applicationService.deleteApplication(
        applications,
        id,
      );

      setApplications(updatedApplications);
    } catch (error) {
      setError("Failed to delete application.");

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateApplication(updatedApplication) {
    try {
      setIsLoading(true);
      setError(null);

      const updatedApplications = applicationService.updateApplication(
        applications,
        updatedApplication,
      );

      setApplications(updatedApplications);
    } catch (error) {
      setError("Failed to update application.");

      console.error(error);
    } finally {
      setIsLoading(false);
    }
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

    isLoading,
    error,
  };
}
