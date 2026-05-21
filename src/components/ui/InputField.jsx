import { INPUT_STYLE } from "../../constants";

export function InputField({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-slate-300">
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={[
          INPUT_STYLE,
          error ? "border-rose-500 focus:border-rose-500" : "",
        ].join(" ")}
      />

      {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}
