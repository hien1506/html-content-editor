import { useState } from "react";
import type { ContentField } from "../lib/types";

const DANGEROUS_URL = /^\s*(javascript|data|vbscript)\s*:/i;

function isSafeUrl(value: string): boolean {
  return !DANGEROUS_URL.test(value);
}

interface ImageFieldGroupProps {
  srcField: ContentField;
  altField: ContentField;
  titleField?: ContentField;
  onChange: (id: string, value: string) => void;
}

export default function ImageFieldGroup({
  srcField,
  altField,
  titleField,
  onChange,
}: ImageFieldGroupProps) {
  const [imgError, setImgError] = useState(false);

  const srcChanged = srcField.value !== srcField.originalValue;
  const altChanged = altField.value !== altField.originalValue;
  const titleChanged = titleField
    ? titleField.value !== titleField.originalValue
    : false;
  const hasDangerousUrl = !isSafeUrl(srcField.value);
  const cardHighlight = altChanged || titleChanged;

  const showPreview = srcField.value && isSafeUrl(srcField.value) && !imgError;

  const srcInputClasses = [
    "w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 font-mono text-xs",
    "placeholder:text-gray-400",
    "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20",
    "transition duration-150",
    hasDangerousUrl
      ? "border-red-400 bg-red-50/30"
      : srcChanged
        ? "border-amber-300 bg-amber-50/30"
        : "border-gray-300",
  ].join(" ");

  const altInputClasses = [
    "w-full bg-transparent px-3 py-2 text-sm text-gray-700",
    "placeholder:text-gray-400",
    "focus-visible:outline-none",
    "transition duration-150",
  ].join(" ");

  return (
    <div className="space-y-2">
      {/* src/srcset label + input */}
      <div className="flex items-center gap-2">
        <label
          htmlFor={srcField.id}
          className="text-xs font-medium text-gray-500"
        >
          {srcField.label}
        </label>
        {srcChanged && (
          <>
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
              aria-hidden="true"
            />
            <span className="sr-only">Changed</span>
            <button
              type="button"
              onClick={() => onChange(srcField.id, srcField.originalValue)}
              className="text-xs text-gray-400 transition-colors duration-150 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
              aria-label={`Reset ${srcField.label} to original value`}
            >
              Reset
            </button>
          </>
        )}
      </div>

      <input
        id={srcField.id}
        type="url"
        value={srcField.value}
        onChange={(e) => {
          setImgError(false);
          onChange(srcField.id, e.target.value);
        }}
        spellCheck={false}
        autoComplete="off"
        className={srcInputClasses}
      />

      {hasDangerousUrl && (
        <p className="text-xs text-red-600" role="alert">
          Blocked: javascript:, data:, and vbscript: URLs are not allowed.
        </p>
      )}

      {/* Image preview + alt text as a single card */}
      <div
        className={[
          "overflow-hidden rounded-lg border",
          cardHighlight
            ? "border-amber-300"
            : "border-gray-200",
        ].join(" ")}
      >
        {showPreview && (
          <div className="bg-gray-50 px-3 py-2">
            <img
              src={srcField.value}
              alt={altField.value}
              className="h-12 w-auto rounded object-contain"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          </div>
        )}

        <div
          className={[
            "group/alt flex items-center gap-2 border-t",
            "transition-[background-color,box-shadow] duration-150",
            showPreview ? "border-gray-200" : "border-transparent",
            altChanged ? "bg-amber-50/30" : "bg-gray-50/60",
            "focus-within:bg-white focus-within:shadow-[inset_2px_0_0_var(--color-accent)]",
          ].join(" ")}
        >
          <label
            htmlFor={altField.id}
            className="ml-3 w-12 shrink-0 text-xs font-medium text-gray-400 group-focus-within/alt:text-gray-700 select-none transition-colors duration-150"
          >
            Alt text
          </label>
          <input
            id={altField.id}
            type="text"
            value={altField.value}
            onChange={(e) => onChange(altField.id, e.target.value)}
            placeholder="Describe this image…"
            autoComplete="off"
            className={altInputClasses}
          />
          {altChanged && (
            <div className="flex shrink-0 items-center gap-1.5 pr-3">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => onChange(altField.id, altField.originalValue)}
                className="text-xs text-gray-400 transition-colors duration-150 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                aria-label="Reset alt text to original value"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {titleField && (
          <div
            className={[
              "group/title flex items-center gap-2 border-t border-gray-200",
              "transition-[background-color,box-shadow] duration-150",
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
              className={altInputClasses}
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
        )}
      </div>
    </div>
  );
}
