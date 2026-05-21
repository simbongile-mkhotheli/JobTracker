import { X } from "lucide-react";

import { UI_STYLES } from "../../styles/ui";

export function Modal({ title, description, onClose, children }) {
  return (
    <div className={UI_STYLES.modalOverlay}>
      <div className={UI_STYLES.modalContainer}>
        <div
          className="
            absolute inset-0
            bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_38%)]
            opacity-90
          "
        />

        <div
          className="
            relative z-10 flex items-start justify-between gap-4
            border-b border-white/10
            px-4 py-4 sm:px-6 sm:py-5
          "
        >
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              {title}
            </h2>

            {description ? (
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="
              inline-flex h-11 w-11 shrink-0 items-center justify-center
              rounded-lg sm:rounded-xl
              border border-white/10
              bg-white/5 text-slate-300
              transition-all duration-200
              hover:border-white/20
              hover:bg-white/10
              hover:text-white
              active:scale-95
            "
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative z-10 max-h-[70vh] overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
