import { INPUT_STYLE } from "../../constants";

export function TextareaField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-slate-300">
        {label}
      </label>

      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={[
          `${INPUT_STYLE} resize-none`,
          error ? "border-rose-500 focus:border-rose-500" : "",
        ].join(" ")}
      />

      {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}
