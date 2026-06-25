import type {
  Application,
  ApplicationStats,
} from "../types/application";

export function calculateApplicationStats(
  applications: Application[],
): ApplicationStats {
  const total = applications.length;

  const interviews = applications.filter(
    (application) => application.status === "Interview",
  ).length;

  const offers = applications.filter(
    (application) => application.status === "Offer",
  ).length;

  const rejected = applications.filter(
    (application) => application.status === "Rejected",
  ).length;

  return {
    total,
    interviews,
    offers,
    rejected,
  };
}
