// components/ApplicationCard.jsx

import { Calendar, PencilLine, Trash2 } from "lucide-react";

import { STATUS_STYLES } from "../constants";

import {
  formatDate,
  getInitials,
  getLogoSrc,
} from "../utils/applicationHelpers";

export function ApplicationCard({ application, onDelete, onEdit }) {
  const { id, company, role, status, dateApplied } = application;

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
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                overflow-hidden rounded-[14px]
                border border-white/10
                bg-white/5
                text-sm font-semibold text-slate-200
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
              <h3 className="truncate text-[17px] font-semibold text-white">
                {company}
              </h3>

              <p className="mt-1 truncate text-[14px] text-slate-400">{role}</p>

              <div className="mt-3">
                <span
                  className={[
                    "inline-flex rounded-full border px-3 py-1 text-[12px] font-medium",
                    STATUS_STYLES[status],
                  ].join(" ")}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(application)}
              aria-label={`Edit ${company}`}
              className="
                grid h-9 w-9 place-items-center
                rounded-[12px]
                border border-white/10
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
                grid h-9 w-9 place-items-center
                rounded-[12px]
                border border-white/10
                bg-white/5 text-slate-300
                transition duration-200
                hover:border-rose-400/30
                hover:bg-rose-500/10
                hover:text-rose-300
              "
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <Calendar size={15} className="text-slate-500" />

            <span>{formatDate(dateApplied)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
