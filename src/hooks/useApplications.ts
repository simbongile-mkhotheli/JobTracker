import { useEffect, useMemo, useState } from "react";

import { applicationService } from "../services/applicationService";
import { filterApplications } from "../utils/filterApplications";
import { calculateApplicationStats } from "../utils/calculateApplicationStats";
import type {
  Application,
  ApplicationId,
  ApplicationStatusFilter,
  ApplicationUpdate,
  NewApplication,
} from "../types/application";

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ApplicationStatusFilter>("All");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadApplications() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await applicationService.getAllApplications();
        setApplications(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load applications.");
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadApplications();
  }, []);

  async function addApplication(application: NewApplication) {
    try {
      setIsLoading(true);
      setError(null);

      const createdApplication =
        await applicationService.createApplication(application);

      setApplications((currentApplications) => [
        createdApplication,
        ...currentApplications,
      ]);
    } catch (err) {
      console.error(err);
      setError("Failed to create application.");
    } finally {
      setIsLoading(false);
    }
  }

  async function updateApplication(updatedApplication: ApplicationUpdate) {
    try {
      setIsLoading(true);
      setError(null);

      const savedApplication =
        await applicationService.updateApplication(updatedApplication);

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === savedApplication.id
            ? savedApplication
            : application,
        ),
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update application.");
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteApplication(id: ApplicationId) {
    try {
      setIsLoading(true);
      setError(null);

      await applicationService.deleteApplication(id);

      setApplications((currentApplications) =>
        currentApplications.filter((application) => application.id !== id),
      );
    } catch (err) {
      console.error(err);
      setError("Failed to delete application.");
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
