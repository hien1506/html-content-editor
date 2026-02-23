import type { ContentField } from '../lib/types';

const DANGEROUS_URL = /^\s*(javascript|data|vbscript)\s*:/i;

function isSafeUrl(value: string): boolean {
  return !DANGEROUS_URL.test(value);
}

interface EditableFieldProps {
  field: ContentField;
  onChange: (id: string, value: string) => void;
}

export default function EditableField({ field, onChange }: EditableFieldProps) {
  const isChanged = field.value !== field.originalValue;
  const isUrl =
    field.property === 'href' ||
    field.property === 'src' ||
    field.property === 'srcset';
  const isLongText =
    field.property === 'textContent' && field.originalValue.length > 80;
  const hasDangerousUrl = isUrl && !isSafeUrl(field.value);

  const inputClasses = [
    'w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900',
    'placeholder:text-gray-400',
    'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20',
    'transition duration-150',
    hasDangerousUrl
      ? 'border-red-400 bg-red-50/30'
      : isChanged
        ? 'border-amber-300 bg-amber-50/30'
        : 'border-gray-300',
    isUrl ? 'font-mono text-xs' : '',
  ].join(' ');

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label
          htmlFor={field.id}
          className="text-xs font-medium text-gray-500"
        >
          {field.label}
        </label>
        {isChanged && (
          <>
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
              aria-hidden="true"
            />
            <span className="sr-only">Changed</span>
            <button
              type="button"
              onClick={() => onChange(field.id, field.originalValue)}
              className="text-xs text-gray-400 transition-colors duration-150 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
              aria-label={`Reset ${field.label} to original value`}
            >
              Reset
            </button>
          </>
        )}
      </div>

      {isLongText ? (
        <textarea
          id={field.id}
          value={field.value}
          onChange={(e) => onChange(field.id, e.target.value)}
          rows={3}
          spellCheck={isUrl ? false : undefined}
          autoComplete="off"
          className={inputClasses + ' resize-y'}
        />
      ) : (
        <input
          id={field.id}
          type={isUrl ? 'url' : 'text'}
          value={field.value}
          onChange={(e) => onChange(field.id, e.target.value)}
          spellCheck={isUrl ? false : undefined}
          autoComplete="off"
          className={inputClasses}
        />
      )}

      {hasDangerousUrl && (
        <p className="text-xs text-red-600" role="alert">
          Blocked: javascript:, data:, and vbscript: URLs are not allowed.
        </p>
      )}

      {(field.property === 'src' || field.property === 'srcset') &&
        field.value &&
        isSafeUrl(field.value) && (
          <img
            src={field.value}
            alt=""
            className="mt-1 h-12 w-auto rounded border border-gray-200 object-contain"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
    </div>
  );
}
