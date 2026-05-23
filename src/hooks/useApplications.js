import { useEffect, useMemo, useState } from "react";

import { seedApplications } from "../data/seedApplications";

import { applicationService } from "../services/applicationService";

import { filterApplications } from "../utils/filterApplications";

import { calculateApplicationStats } from "../utils/calculateApplicationStats";

export function useApplications() {
  const [applications, setApplications] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadApplications() {
      try {
        setIsLoading(true);

        setError(null);

        const data =
          await applicationService.getAllApplications();

        setApplications(
          data.length > 0
            ? data
            : seedApplications,
        );
      } catch (error) {
        setError("Failed to load applications.");

        console.error(error);

        setApplications(seedApplications);
      } finally {
        setIsLoading(false);
      }
    }

    loadApplications();
  }, []);

  async function addApplication(application) {
    try {
      setIsLoading(true);

      setError(null);

      const createdApplication =
        await applicationService.createApplication(
          application,
        );

      setApplications((current) => [
        createdApplication,
        ...current,
      ]);
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

      await applicationService.deleteApplication(id);

      setApplications((current) =>
        current.filter(
          (application) =>
            application.id !== id,
        ),
      );
    } catch (error) {
      setError("Failed to delete application.");

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateApplication(
    updatedApplication,
  ) {
    try {
      setIsLoading(true);

      setError(null);

      const updated =
        await applicationService.updateApplication(
          updatedApplication,
        );

      setApplications((current) =>
        current.map((application) =>
          application.id === updated.id
            ? updated
            : application,
        ),
      );
    } catch (error) {
      setError("Failed to update application.");

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredApplications = useMemo(() => {
    return filterApplications(
      applications,
      searchTerm,
      statusFilter,
    );
  }, [
    applications,
    searchTerm,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    return calculateApplicationStats(
      filteredApplications,
    );
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