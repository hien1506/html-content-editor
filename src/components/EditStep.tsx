import { useState, useMemo } from "react";
import type { FieldGroup as FieldGroupType } from "../lib/types";
import FieldGroup from "./FieldGroup";
import PreviewPanel from "./PreviewPanel";

interface EditStepProps {
  groups: FieldGroupType[];
  previewHtml: string;
  onFieldChange: (fieldId: string, value: string) => void;
  onExport: () => void;
  onStartOver: () => void;
}

export default function EditStep({
  groups,
  previewHtml,
  onFieldChange,
  onExport,
  onStartOver,
}: EditStepProps) {
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [confirmingStartOver, setConfirmingStartOver] = useState(false);

  const { totalFields, changedFields } = useMemo(() => {
    let total = 0;
    let changed = 0;
    for (const g of groups) {
      for (const f of g.fields) {
        total++;
        if (f.value !== f.originalValue) changed++;
      }
    }
    return { totalFields: total, changedFields: changed };
  }, [groups]);

  function handleStartOver() {
    if (changedFields > 0 && !confirmingStartOver) {
      setConfirmingStartOver(true);
      setTimeout(() => setConfirmingStartOver(false), 3000);
      return;
    }
    setConfirmingStartOver(false);
    onStartOver();
  }

  return (
    <div className="flex h-screen flex-col animate-fade-in">
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-semibold text-gray-900">
            Content Editor
          </h1>
          <p
            className="hidden text-xs text-gray-500 sm:block"
            aria-live="polite"
          >
            {totalFields} field{totalFields !== 1 ? "s" : ""}
            {changedFields > 0 && (
              <span className="text-amber-600">
                {" "}
                &middot; {changedFields} changed
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartOver}
            aria-label="Start Over"
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97] ${
              confirmingStartOver
                ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                : "border-gray-300 bg-white text-black hover:bg-gray-50"
            }`}
          >
            <span className="hidden sm:inline">
              {confirmingStartOver ? "Discard Changes?" : "Start Over"}
            </span>
            {!confirmingStartOver && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sm:hidden"
                aria-hidden="true"
              >
                <path d="M2 8a6 6 0 0111.47-2.47" />
                <path d="M14 2v4h-4" />
                <path d="M14 8a6 6 0 01-11.47 2.47" />
                <path d="M2 14v-4h4" />
              </svg>
            )}
            {confirmingStartOver && (
              <span className="sm:hidden text-xs">Discard?</span>
            )}
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition duration-150 hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97]"
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
              aria-hidden="true"
            >
              <rect x="5" y="5" width="8" height="8" rx="1.5" />
              <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" />
            </svg>
            Copy HTML
          </button>
        </div>
      </header>

      <div className="flex border-b border-gray-200 lg:hidden" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "edit"}
          aria-controls="panel-edit"
          id="tab-edit"
          onClick={() => setViewMode("edit")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-150 ${
            viewMode === "edit"
              ? "border-b-2 border-accent text-accent"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Edit Fields
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "preview"}
          aria-controls="panel-preview"
          id="tab-preview"
          onClick={() => setViewMode("preview")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-150 ${
            viewMode === "preview"
              ? "border-b-2 border-accent text-accent"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Preview
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          id="panel-edit"
          role="tabpanel"
          aria-labelledby="tab-edit"
          className={`flex-1 overflow-y-auto overscroll-contain bg-gray-50 p-4 lg:block lg:p-6 ${
            viewMode === "preview" ? "hidden" : ""
          }`}
        >
          <div className="mx-auto max-w-4xl space-y-3">
            {groups.map((group, i) => (
              <FieldGroup
                key={group.id}
                group={group}
                onChange={onFieldChange}
                defaultExpanded={i === 0}
              />
            ))}
          </div>
        </div>

        <div
          id="panel-preview"
          role="tabpanel"
          aria-labelledby="tab-preview"
          className={`w-full border-l border-gray-200 lg:block lg:w-1/2 ${
            viewMode === "edit" ? "hidden" : ""
          }`}
        >
          <PreviewPanel html={previewHtml} />
        </div>
      </div>
    </div>
  );
}
