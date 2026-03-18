import type { ContentField } from "../lib/types";

const DANGEROUS_URL = /^\s*(javascript|data|vbscript)\s*:/i;

function isSafeUrl(value: string): boolean {
  return !DANGEROUS_URL.test(value);
}

interface LinkFieldGroupProps {
  hrefField: ContentField;
  titleField: ContentField;
  textField?: ContentField;
  onChange: (id: string, value: string) => void;
}

export default function LinkFieldGroup({
  hrefField,
  titleField,
  textField,
  onChange,
}: LinkFieldGroupProps) {
  const hrefChanged = hrefField.value !== hrefField.originalValue;
  const titleChanged = titleField.value !== titleField.originalValue;
  const textChanged = textField
    ? textField.value !== textField.originalValue
    : false;
  const hasDangerousUrl = !isSafeUrl(hrefField.value);

  const urlInputClasses = [
    "w-full rounded-t-lg border border-b-0 bg-white px-3 py-2 text-sm text-gray-900 font-mono text-xs",
    "placeholder:text-gray-400",
    "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20",
    "transition duration-150",
    hasDangerousUrl
      ? "border-red-400 bg-red-50/30"
      : hrefChanged
        ? "border-amber-300 bg-amber-50/30"
        : "border-gray-300",
  ].join(" ");

  const inlineInputClasses = [
    "w-full bg-transparent px-3 py-2 text-sm text-gray-700",
    "placeholder:text-gray-400",
    "focus-visible:outline-none",
    "transition duration-150",
  ].join(" ");

  const textInputClasses = [
    "w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900",
    "placeholder:text-gray-400",
    "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20",
    "transition duration-150",
    textChanged ? "border-amber-300 bg-amber-50/30" : "border-gray-300",
  ].join(" ");

  return (
    <div className="space-y-3">
      {/* href + title as a connected unit */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label
            htmlFor={hrefField.id}
            className="text-xs font-medium text-gray-500"
          >
            {hrefField.label}
          </label>
          {hrefChanged && (
            <>
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
                aria-hidden="true"
              />
              <span className="sr-only">Changed</span>
              <button
                type="button"
                onClick={() => onChange(hrefField.id, hrefField.originalValue)}
                className="text-xs text-gray-400 transition-colors duration-150 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                aria-label={`Reset ${hrefField.label} to original value`}
              >
                Reset
              </button>
            </>
          )}
        </div>

        <input
          id={hrefField.id}
          type="url"
          value={hrefField.value}
          onChange={(e) => onChange(hrefField.id, e.target.value)}
          spellCheck={false}
          autoComplete="off"
          className={urlInputClasses}
        />

        <div
          className={[
            "group/title flex items-center gap-2 rounded-b-lg border",
            "transition-[background-color,box-shadow] duration-150",
            hasDangerousUrl
              ? "border-red-400"
              : hrefChanged || titleChanged
                ? "border-amber-300"
                : "border-gray-300",
            titleChanged ? "bg-amber-50/30" : "bg-gray-50/60",
            "focus-within:bg-white focus-within:shadow-[inset_2px_0_0_var(--color-accent)]",
          ].join(" ")}
        >
          <label
            htmlFor={titleField.id}
            className="ml-3 w-12 shrink-0 text-xs font-medium text-gray-400 group-focus-within/title:text-gray-700 select-none transition-colors duration-150"
          >
            Title
          </label>
          <input
            id={titleField.id}
            type="text"
            value={titleField.value}
            onChange={(e) => onChange(titleField.id, e.target.value)}
            placeholder="Tooltip on hover…"
            autoComplete="off"
            className={inlineInputClasses}
          />
          {titleChanged && (
            <div className="flex shrink-0 items-center gap-1.5 pr-3">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() =>
                  onChange(titleField.id, titleField.originalValue)
                }
                className="text-xs text-gray-400 transition-colors duration-150 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                aria-label="Reset title to original value"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {hasDangerousUrl && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            Blocked: javascript:, data:, and vbscript: URLs are not allowed.
          </p>
        )}
      </div>

      {/* Link text as a separate field */}
      {textField && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <label
              htmlFor={textField.id}
              className="text-xs font-medium text-gray-500"
            >
              {textField.label}
            </label>
            {textChanged && (
              <>
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
                  aria-hidden="true"
                />
                <span className="sr-only">Changed</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange(textField.id, textField.originalValue)
                  }
                  className="text-xs text-gray-400 transition-colors duration-150 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                  aria-label={`Reset ${textField.label} to original value`}
                >
                  Reset
                </button>
              </>
            )}
          </div>
          <input
            id={textField.id}
            type="text"
            value={textField.value}
            onChange={(e) => onChange(textField.id, e.target.value)}
            autoComplete="off"
            className={textInputClasses}
          />
        </div>
      )}
    </div>
  );
}
