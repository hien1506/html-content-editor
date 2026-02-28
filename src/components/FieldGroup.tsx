import { useState } from "react";
import type { FieldGroup as FieldGroupType } from "../lib/types";
import EditableField from "./EditableField";

interface FieldGroupProps {
  group: FieldGroupType;
  onChange: (fieldId: string, value: string) => void;
  defaultExpanded?: boolean;
}

export default function FieldGroup({
  group,
  onChange,
  defaultExpanded = false,
}: FieldGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const changedCount = group.fields.filter(
    (f) => f.value !== f.originalValue,
  ).length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
        aria-expanded={expanded}
        aria-controls={`group-content-${group.id}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-gray-400 transition-transform duration-200 ease-out ${
            expanded ? "rotate-90" : ""
          }`}
          aria-hidden="true"
        >
          <path d="M6 4l4 4-4 4" />
        </svg>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {group.label}
          </h3>
          <p className="text-xs text-gray-500">
            {group.fields.length} field{group.fields.length !== 1 ? "s" : ""}
            {changedCount > 0 && (
              <span className="text-amber-600">
                {" "}
                &middot; {changedCount} changed
              </span>
            )}
          </p>
        </div>
      </button>

      {expanded && (
        <div
          id={`group-content-${group.id}`}
          className="space-y-4 border-t border-gray-100 px-4 py-4 animate-fade-in"
        >
          {group.fields.map((field) => (
            <EditableField key={field.id} field={field} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  );
}
