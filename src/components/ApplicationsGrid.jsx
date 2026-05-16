import { ApplicationCard } from "./ApplicationCard";

export function ApplicationsGrid({
  applications,
  onDelete,
  onEdit,
}) {
  return (
  <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}