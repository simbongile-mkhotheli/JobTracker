import { SearchX, Inbox } from "lucide-react";

export function EmptyState({
  title = "No applications yet",
  description = "Add your first application to start tracking progress.",
  actionLabel,
  onAction,
  variant = "default",
}) {
  const Icon = variant === "search" ? SearchX : Inbox;

  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-[18px] border border-white/10 bg-white/5 p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300">
          <Icon size={22} />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          {description}
        </p>

        {onAction && actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
