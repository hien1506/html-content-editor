import { useState, useMemo } from "react";
import type { FieldGroup as FieldGroupType, ContentField } from "../lib/types";
import EditableField from "./EditableField";
import ImageFieldGroup from "./ImageFieldGroup";
import LinkFieldGroup from "./LinkFieldGroup";

type RenderItem =
  | { kind: "field"; field: ContentField }
  | {
      kind: "image";
      srcField: ContentField;
      altField: ContentField;
      titleField?: ContentField;
    }
  | {
      kind: "link";
      hrefField: ContentField;
      titleField: ContentField;
      textField?: ContentField;
    };

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

  const renderItems = useMemo(() => {
    const items: RenderItem[] = [];
    const consumedIds = new Set<string>();

    // Pre-scan: mark fields that will be consumed by image groups
    for (const field of group.fields) {
      if (field.property !== "src" && field.property !== "srcset") continue;
      if (field.tag !== "img") continue;
      const altField = group.fields.find(
        (f) => f.elementId === field.elementId && f.property === "alt",
      );
      if (altField) consumedIds.add(altField.id);
      const titleField = group.fields.find(
        (f) => f.elementId === field.elementId && f.property === "title",
      );
      if (titleField) consumedIds.add(titleField.id);
    }

    // Pre-scan: mark fields that will be consumed by link groups
    for (const field of group.fields) {
      if (field.property !== "href" || field.tag !== "a") continue;
      const titleField = group.fields.find(
        (f) => f.elementId === field.elementId && f.property === "title",
      );
      if (!titleField) continue;
      consumedIds.add(titleField.id);
      const textField = group.fields.find(
        (f) => f.elementId === field.elementId && f.property === "textContent",
      );
      if (textField) consumedIds.add(textField.id);
    }

    for (const field of group.fields) {
      if (consumedIds.has(field.id)) continue;

      // Image group: src/srcset + alt (+ optional title)
      if (
        (field.property === "src" || field.property === "srcset") &&
        field.tag === "img"
      ) {
        const altField = group.fields.find(
          (f) => f.elementId === field.elementId && f.property === "alt",
        );
        if (altField) {
          const titleField = group.fields.find(
            (f) => f.elementId === field.elementId && f.property === "title",
          );
          items.push({
            kind: "image",
            srcField: field,
            altField,
            titleField,
          });
          continue;
        }
      }

      // Link group: href + title (+ optional textContent)
      if (field.property === "href" && field.tag === "a") {
        const titleField = group.fields.find(
          (f) => f.elementId === field.elementId && f.property === "title",
        );
        if (titleField) {
          const textField = group.fields.find(
            (f) =>
              f.elementId === field.elementId &&
              f.property === "textContent",
          );
          items.push({
            kind: "link",
            hrefField: field,
            titleField,
            textField,
          });
          continue;
        }
      }

      items.push({ kind: "field", field });
    }

    return items;
  }, [group.fields]);

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
          {renderItems.map((item) => {
            if (item.kind === "image") {
              return (
                <ImageFieldGroup
                  key={item.srcField.id}
                  srcField={item.srcField}
                  altField={item.altField}
                  titleField={item.titleField}
                  onChange={onChange}
                />
              );
            }
            if (item.kind === "link") {
              return (
                <LinkFieldGroup
                  key={item.hrefField.id}
                  hrefField={item.hrefField}
                  titleField={item.titleField}
                  textField={item.textField}
                  onChange={onChange}
                />
              );
            }
            return (
              <EditableField
                key={item.field.id}
                field={item.field}
                onChange={onChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
