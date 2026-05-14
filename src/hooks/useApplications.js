import { useEffect, useMemo, useState } from "react";
import { seedApplications } from "../data/seedApplications";
import { applicationService } from "../services/applicationService";

export function useApplications() {
  const [applications, setApplications] = useState(() => {
    const storedApplications = applicationService.getApplications();

    return storedApplications.length > 0
      ? storedApplications
      : seedApplications;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesSearch =
        application.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = filteredApplications.length;

    const interviews = filteredApplications.filter(
      (application) => application.status === "Interview",
    ).length;

    const offers = filteredApplications.filter(
      (application) => application.status === "Offer",
    ).length;

    const rejected = filteredApplications.filter(
      (application) => application.status === "Rejected",
    ).length;

    return {
      total,
      interviews,
      offers,
      rejected,
    };
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
