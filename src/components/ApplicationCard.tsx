import { useState } from "react";
import { Calendar, FileText, PencilLine, Trash2 } from "lucide-react";

import { STATUS_STYLES } from "../constants";
import { UI_STYLES } from "../styles/ui";

import { formatDate, getInitials } from "../utils/applicationHelpers";
import type { Application, ApplicationId } from "../types/application";

interface ApplicationCardProps {
  application: Application;
  onDelete: (id: ApplicationId) => boolean | Promise<boolean>;
  onEdit: (application: Application) => void;
  onOpenNotes: (application: Application) => void;
}

export function ApplicationCard({
  application,
  onDelete,
  onEdit,
  onOpenNotes,
}: ApplicationCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const { id, company, role, status, dateApplied, notes } = application;

  const logoSrc = application.logoUrl || null;

  const initials = getInitials(company);

  async function handleConfirmDelete() {
    const wasDeleted = await onDelete(id);

    if (!wasDeleted) {
      setIsConfirmingDelete(false);
    }
  }

  return (
    <article className={`group ${UI_STYLES.card} p-5`}>
      <div className={UI_STYLES.cardGlow} />

      <div className={UI_STYLES.cardBorder} />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                overflow-hidden rounded-[12px]
                border border-white/10
                bg-white/5
                text-xs font-semibold text-slate-200
                sm:h-11 sm:w-11 sm:text-sm
              "
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={`${company} logo`}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-white sm:text-[17px]">
                {company}
              </h3>

              <p className="mt-0.5 truncate text-xs text-slate-400 sm:mt-1 sm:text-[14px]">
                {role}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div className="flex flex-col gap-3">
            <span
              className={[
                "inline-flex w-fit rounded-full border px-4 py-2 text-[12px] font-medium",
                STATUS_STYLES[status],
              ].join(" ")}
            >
              {status}
            </span>

            <div className="flex items-center gap-2 text-xs text-slate-400 sm:text-[13px]">
              <Calendar
                size={14}
                className="text-slate-500 sm:h-[15px] sm:w-[15px]"
              />

              <span>{formatDate(dateApplied)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(application)}
              aria-label={`Edit ${company}`}
              className="
                grid h-10 w-10 shrink-0 place-items-center
                rounded-xl border border-white/10
                bg-white/5 text-slate-300
                transition duration-200
                hover:border-sky-400/30
                hover:bg-sky-500/10
                hover:text-sky-300
              "
            >
              <PencilLine size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsConfirmingDelete(true);
              }}
              aria-label={`Delete ${company}`}
              disabled={isConfirmingDelete}
              className="
                grid h-10 w-10 shrink-0 place-items-center
                rounded-xl border border-rose-400/30
                bg-rose-500/10 text-rose-300
                transition duration-200
                hover:border-rose-400/50
                hover:bg-rose-500/20
                hover:text-rose-200
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {isConfirmingDelete ? (
          <div
            role="group"
            aria-label={`Confirm deleting ${company}`}
            className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3"
          >
            <p className="text-sm font-medium text-rose-100">
              Delete this application?
            </p>

            <p className="mt-1 text-xs leading-5 text-rose-100/70">
              This removes {company} from your tracker.
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium text-slate-200 transition hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleConfirmDelete();
                }}
                className="h-9 rounded-lg border border-rose-300/30 bg-rose-500/20 px-3 text-xs font-medium text-rose-100 transition hover:bg-rose-500/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => onOpenNotes(application)}
            className={[
              "flex w-full items-center gap-2 text-xs font-medium transition",
              notes
                ? "text-slate-400 hover:text-slate-300 cursor-pointer"
                : "text-slate-600 cursor-not-allowed",
            ].join(" ")}
            aria-expanded={false}
            disabled={!notes}
          >
            <FileText
              size={14}
              className={notes ? "text-slate-500" : "text-slate-700"}
            />
            <span>Notes</span>
            <span className="ml-auto text-[10px]">{notes ? "+" : "-"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
