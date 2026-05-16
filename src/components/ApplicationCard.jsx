// components/ApplicationCard.jsx

import { useState } from "react";
import { Calendar, FileText, PencilLine, Trash2 } from "lucide-react";

import { STATUS_STYLES } from "../constants";

import {
  formatDate,
  getInitials,
  getLogoSrc,
} from "../utils/applicationHelpers";

export function ApplicationCard({ application, onDelete, onEdit }) {
  const { id, company, role, status, dateApplied, notes } = application;
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const logoSrc = getLogoSrc(application);

  const initials = getInitials(company);

  return (
    <article
      className="
        group relative overflow-hidden
        rounded-[18px]
        border border-[#243255]
        bg-[linear-gradient(180deg,#0f1930_0%,#0b1426_100%)]
        p-5
        shadow-[0_10px_30px_rgba(0,0,0,0.22)]
        transition-all duration-300 ease-out
        hover:-translate-y-1
        hover:border-[#4f63a7]
        hover:shadow-[0_22px_50px_rgba(0,0,0,0.32)]
      "
    >
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_38%)]
          opacity-80 transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      <div className="pointer-events-none absolute inset-px rounded-[17px] border border-white/5" />

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
              onClick={() => onDelete(id)}
              aria-label={`Delete ${company}`}
              className="
                grid h-10 w-10 shrink-0 place-items-center
                rounded-xl border border-rose-400/30
                bg-rose-500/10 text-rose-300
                transition duration-200
                hover:border-rose-400/50
                hover:bg-rose-500/20
                hover:text-rose-200
              "
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => notes && setIsNotesOpen(!isNotesOpen)}
            className={[
              "flex w-full items-center gap-2 text-xs font-medium transition",
              notes
                ? "text-slate-400 hover:text-slate-300 cursor-pointer"
                : "text-slate-600 cursor-not-allowed",
            ].join(" ")}
            aria-expanded={isNotesOpen}
            disabled={!notes}
          >
            <FileText
              size={14}
              className={notes ? "text-slate-500" : "text-slate-700"}
            />
            <span>Notes</span>
            <span className="ml-auto text-[10px]">
              {notes ? (isNotesOpen ? "−" : "+") : "−"}
            </span>
          </button>

          {notes && isNotesOpen && (
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              {notes}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
