import type {
  Application,
  ApplicationStatusFilter,
} from "../types/application";

export function filterApplications(
  applications: Application[],
  searchTerm: string,
  statusFilter: ApplicationStatusFilter,
) {
  return applications.filter((application) => {
    const matchesSearch =
      application.company
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      application.role
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      application.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}
