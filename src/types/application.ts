export const APPLICATION_STATUSES = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type ApplicationStatusFilter = ApplicationStatus | "All";

export type ApplicationId = number;

export interface ApplicationFormValues {
  company: string;
  role: string;
  website: string;
  logoUrl: string;
  dateApplied: string;
  status: ApplicationStatus;
  notes: string;
}

export interface Application extends ApplicationFormValues {
  id: ApplicationId;
  user_id: string;
  created_at: string;
}

export type NewApplication = ApplicationFormValues;

export type ApplicationUpdate = ApplicationFormValues & {
  id: ApplicationId;
};

export interface ApplicationRow {
  id: ApplicationId;
  created_at: string;
  user_id: string;
  company: string;
  role: string;
  website: string | null;
  logo_url: string | null;
  date_applied: string | null;
  status: ApplicationStatus;
  notes: string | null;
}

export interface ApplicationDbPayload {
  company: string;
  role: string;
  website: string;
  logo_url: string;
  date_applied: string;
  status: ApplicationStatus;
  notes: string;
}

export interface ApplicationStats {
  total: number;
  interviews: number;
  offers: number;
  rejected: number;
}
