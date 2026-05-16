export function filterApplications(
  applications,
  searchTerm,
  statusFilter,
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