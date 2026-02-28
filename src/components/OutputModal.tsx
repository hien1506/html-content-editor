import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { html as beautify } from "js-beautify";

interface OutputModalProps {
  html: string;
  onClose: () => void;
}

export default function OutputModal({ html, onClose }: OutputModalProps) {
  const [formatted, setFormatted] = useState(false);
  const [copied, setCopied] = useState(false);
  const formattedHtml = useMemo(
    () =>
      beautify(html, {
        indent_size: 1,
        indent_char: "\t",
        indent_inner_html: true,
        wrap_line_length: 0,
        preserve_newlines: false,
        end_with_newline: false,
      }),
    [html],
  );
  const displayHtml = formatted ? formattedHtml : html;
  const copyBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    copyBtnRef.current?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", trapFocus);
    };
  }, [onClose, trapFocus]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(displayHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = displayHtml;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in motion-reduce:animate-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="output-modal-title"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-scale-in motion-reduce:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2
            id="output-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            Updated HTML
          </h2>
          <div className="flex items-center gap-2">
            <div
              className="flex rounded-full bg-gray-100 p-0.5 text-sm font-medium"
              role="radiogroup"
              aria-label="View mode"
            >
              <button
                type="button"
                role="radio"
                aria-checked={!formatted}
                onClick={() => setFormatted(false)}
                className={`rounded-full px-3 py-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${!formatted ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Raw
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={formatted}
                onClick={() => setFormatted(true)}
                className={`rounded-full px-3 py-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${formatted ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Formatted
              </button>
            </div>
            <button
              ref={copyBtnRef}
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97] motion-reduce:transform-none"
            >
              {copied ? (
                <>
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
                    <path d="M3 8.5l3.5 3.5 6.5-8" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
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
                  Copy
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto overscroll-contain bg-gray-950 p-6">
          <pre className="whitespace-pre-wrap wrap-break-word font-mono text-xs leading-relaxed text-gray-200">
            <code>{displayHtml}</code>
          </pre>
        </div>

        <div className="flex items-center justify-end border-t border-gray-200 bg-gray-50 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97] motion-reduce:transform-none"
          >
            Back to Edit
          </button>
        </div>
      </div>
    </div>
  );
}
