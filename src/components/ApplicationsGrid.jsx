import { ApplicationCard } from "./ApplicationCard";

export function ApplicationsGrid({
  applications,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}