import { ApplicationCard } from "./ApplicationCard";
import { EmptyState } from "./EmptyState";
import { SkeletonCard } from "./SkeletonCard";
import type {
  Application,
  ApplicationId,
} from "../types/application";

interface ApplicationsGridProps {
  applications: Application[];
  onDelete: (id: ApplicationId) => boolean | Promise<boolean>;
  onEdit: (application: Application) => void;
  onOpenNotes: (application: Application) => void;
  onAddNew: () => void;
  onClearSearch: () => void;
  isLoading?: boolean;
  searchTerm?: string;
}

export function ApplicationsGrid({
  applications,
  onDelete,
  onEdit,
  onOpenNotes,
  onAddNew,
  onClearSearch,
  isLoading = false,
  searchTerm = "",
}: ApplicationsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    const isSearchEmpty = searchTerm.trim().length > 0;

    return (
      <EmptyState
        variant={isSearchEmpty ? "search" : "default"}
        title={
          isSearchEmpty
            ? "No matching applications"
            : "No applications yet"
        }
        description={
          isSearchEmpty
            ? "Try a different search term or clear your filters."
            : "Add your first application to start tracking progress."
        }
        actionLabel={
          isSearchEmpty ? "Clear Search" : "Add Application"
        }
        onAction={isSearchEmpty ? onClearSearch : onAddNew}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          onDelete={onDelete}
          onEdit={onEdit}
          onOpenNotes={onOpenNotes}
        />
      ))}
    </div>
  );
}
