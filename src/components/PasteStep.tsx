import { useState, useRef, useEffect } from "react";

interface PasteStepProps {
  onParse: (html: string) => void;
  error: string;
}

export default function PasteStep({ onParse, error }: PasteStepProps) {
  const [html, setHtml] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMac =
    typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);

  useEffect(() => {
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (!isCoarsePointer) textareaRef.current?.focus();
  }, []);

  function handleSubmit() {
    const trimmed = html.trim();
    if (!trimmed) return;
    onParse(trimmed);
  }

  return (
    <div className="flex min-h-screen justify-center px-4 py-8 animate-fade-in">
      <div className="w-full max-w-4xl ">
        <div className="mb-16">
          <h1
            className="text-md font-mono font-bold tracking-tight text-gray-900"
            style={{ textWrap: "balance" }}
          >
            HTML CONTENT EDITOR
          </h1>
          <ol className="mt-4 font-mono inline-block text-left text-sm text-gray-500 space-y-1 list-decimal list-inside">
            <li>Paste your HTML below</li>
            <li>Edit the extracted text, links, &amp; images</li>
            <li>Format &amp; copy the updated HTML back</li>
          </ol>
        </div>

        <textarea
          ref={textareaRef}
          id="html-input"
          aria-label="HTML content"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={"Paste your HTML here\u2026"}
          spellCheck={false}
          autoComplete="off"
          rows={14}
          className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm text-gray-900 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] placeholder:text-gray-400 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20"
        />

        {error && (
          <p
            className="mt-2 text-sm text-red-600 animate-slide-up"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-4 flex items-center justify-end gap-3">
          <kbd className="hidden text-xs text-gray-400 sm:inline">
            {isMac ? "\u2318" : "Ctrl"}
            {isMac ? "" : "+"}
            <span className="mx-1">Enter</span>
          </kbd>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!html.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97] motion-reduce:transform-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Edit Content
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
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
