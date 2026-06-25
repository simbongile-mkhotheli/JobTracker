import { X } from "lucide-react";

import type { Application } from "../types/application";

interface ApplicationNotesModalProps {
  application: Application | null;
  onClose: () => void;
}

export function ApplicationNotesModal({
  application,
  onClose,
}: ApplicationNotesModalProps) {
  if (!application) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,#0f1930_0%,#0b1426_100%)] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_38%)] opacity-90" />

        <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {application.company}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {application.role}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative z-10 p-6">
          <h3 className="mb-3 text-sm font-medium text-slate-300">
            Notes
          </h3>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
            {application.notes || "No notes added."}
          </div>
        </div>
      </div>
    </div>
  );
}
