import {
  APPLICATION_STATUSES,
  type ApplicationFormValues,
} from "../types/application";

export const STATUS_OPTIONS = APPLICATION_STATUSES;

export const INITIAL_APPLICATION: ApplicationFormValues = {
  company: "",
  role: "",
  website: "",
  logoUrl: "",
  dateApplied: "",
  status: "Applied",
  notes: "",
};
