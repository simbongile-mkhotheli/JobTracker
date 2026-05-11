import { Calendar, Trash2 } from "lucide-react";

const STATUS_STYLES = {
  Applied: "bg-sky-500/15 text-sky-300 border-sky-500/20",
  Interview: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  Rejected: "bg-rose-500/15 text-rose-300 border-rose-500/20",
  Offer: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
};

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ApplicationCard({ application, onDelete }) {
  const { company, role, status, dateApplied } = application;

  return (
    <article className="rounded-[18px] border border-[#243255] bg-[linear-gradient(180deg,#0f1930_0%,#0b1426_100%)] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[17px] font-semibold text-white">
            {company}
          </h3>

          <p className="mt-1 text-[14px] text-slate-400">
            {role}
          </p>

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

      <div className="mt-5 flex items-center gap-2 text-[13px] text-slate-400">
        <Calendar size={15} />
        <span>{formatDate(dateApplied)}</span>
      </div>

      <button
        type="button"
        onClick={() => onDelete(application.id)}
        className="mt-4 inline-flex items-center rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-500/20"
      >
        <Trash2 size={14} className="mr-2" />
        Remove
      </button>
    </article>
  );
}