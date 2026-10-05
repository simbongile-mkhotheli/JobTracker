import { useEffect, useMemo, useState } from "react";

import {
  ApplicationServiceError,
  applicationService,
} from "../services/applicationService";
import { filterApplications } from "../utils/filterApplications";
import { calculateApplicationStats } from "../utils/calculateApplicationStats";
import type {
  Application,
  ApplicationId,
  ApplicationStatusFilter,
  ApplicationUpdate,
  NewApplication,
} from "../types/application";

function getApplicationErrorDiagnostics(err: unknown) {
  if (err instanceof ApplicationServiceError) {
    return {
      operation: err.operation,
      applicationId: err.applicationId,
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
      originalError: err.originalError,
    };
  }

  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      originalError: err,
    };
  }

  return {
    message: "Non-Error value thrown.",
    originalError: err,
  };
}

function logApplicationError(action: string, err: unknown) {
  console.error(`Failed to ${action}:`, getApplicationErrorDiagnostics(err));
}

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
        logApplicationError("load applications", err);
        setError("Failed to load applications.");
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    }

    void loadApplications();
  }, []);

  async function addApplication(application: NewApplication): Promise<boolean> {
    try {
      setIsLoading(true);
      setError(null);

      const createdApplication =
        await applicationService.createApplication(application);

      setApplications((currentApplications) => [
        createdApplication,
        ...currentApplications,
      ]);

      return true;
    } catch (err) {
      logApplicationError("create application", err);
      setError("Failed to create application.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function updateApplication(
    updatedApplication: ApplicationUpdate,
  ): Promise<boolean> {
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

      return true;
    } catch (err) {
      logApplicationError("update application", err);
      setError("Failed to update application.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteApplication(id: ApplicationId): Promise<boolean> {
    try {
      setIsLoading(true);
      setError(null);

      await applicationService.deleteApplication(id);

      setApplications((currentApplications) =>
        currentApplications.filter((application) => application.id !== id),
      );

      return true;
    } catch (err) {
      logApplicationError("delete application", err);
      setError("Failed to delete application.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  const filteredApplications = useMemo(() => {
    return filterApplications(applications, searchTerm, statusFilter);
  }, [applications, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return calculateApplicationStats(applications);
  }, [applications]);

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
