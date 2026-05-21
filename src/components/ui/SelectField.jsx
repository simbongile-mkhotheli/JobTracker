import { INPUT_STYLE } from "../../constants";

export function SelectField({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  error,
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-slate-300">
        {label}
      </label>

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={[
          INPUT_STYLE,
          error ? "border-rose-500 focus:border-rose-500" : "",
        ].join(" ")}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}
