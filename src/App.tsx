import { useState, useRef, useCallback, useEffect } from 'react';
import { parseHtml } from './lib/parser';
import { serializeHtml, getPreviewHtml } from './lib/serializer';
import type { FieldGroup, SavedSession } from './lib/types';

const DANGEROUS_URL = /^\s*(javascript|data|vbscript)\s*:/i;
const URL_PROPERTIES = new Set(['href', 'src', 'srcset']);
const STORAGE_KEY = 'html-editor-session';

import PasteStep from './components/PasteStep';
import EditStep from './components/EditStep';
import OutputModal from './components/OutputModal';

function saveSession(html: string, currentGroups: FieldGroup[]) {
  const fieldValues: Record<string, string> = {};
  for (const group of currentGroups) {
    for (const field of group.fields) {
      fieldValues[field.id] = field.value;
    }
  }
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ originalHtml: html, fieldValues, timestamp: Date.now() } satisfies SavedSession),
    );
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedSession;
  } catch {
    clearSession();
    return null;
  }
}

function restoreSession(session: SavedSession) {
  const result = parseHtml(session.originalHtml);
  if (result.groups.length === 0) return null;

  const restoredGroups = result.groups.map((group) => ({
    ...group,
    fields: group.fields.map((field) => {
      const savedValue = session.fieldValues[field.id];
      if (savedValue !== undefined && savedValue !== field.value) {
        const el = result.doc.querySelector(`[data-eid="${field.elementId}"]`);
        if (el) {
          if (field.property === 'textContent') el.textContent = savedValue;
          else el.setAttribute(field.property, savedValue);
        }
        return { ...field, value: savedValue };
      }
      return field;
    }),
  }));

  return { ...result, groups: restoredGroups };
}

function getInitialState() {
  const session = loadSession();
  if (!session) return null;

  try {
    const result = restoreSession(session);
    if (!result) {
      clearSession();
      return null;
    }
    return {
      doc: result.doc,
      isFullDocument: result.isFullDocument,
      groups: result.groups,
      originalHtml: session.originalHtml,
      previewHtml: getPreviewHtml(result.doc, result.isFullDocument),
    };
  } catch {
    clearSession();
    return null;
  }
}

export default function App() {
  const [initial] = useState(getInitialState);

  const [step, setStep] = useState<'paste' | 'edit'>(initial ? 'edit' : 'paste');
  const [groups, setGroups] = useState<FieldGroup[]>(initial?.groups ?? []);
  const [previewHtml, setPreviewHtml] = useState(initial?.previewHtml ?? '');
  const [outputHtml, setOutputHtml] = useState<string | null>(null);
  const [originalHtml, setOriginalHtml] = useState(initial?.originalHtml ?? '');
  const [parseError, setParseError] = useState('');

  const docRef = useRef<Document | null>(initial?.doc ?? null);
  const isFullDocRef = useRef(initial?.isFullDocument ?? false);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const updatePreview = useCallback(() => {
    if (!docRef.current) return;
    setPreviewHtml(getPreviewHtml(docRef.current, isFullDocRef.current));
  }, []);

  const handleParse = useCallback(
    (html: string) => {
      try {
        const result = parseHtml(html);

        if (result.groups.length === 0) {
          setParseError(
            'No editable content found. Make sure your HTML contains text, images, or links.',
          );
          return;
        }

        docRef.current = result.doc;
        isFullDocRef.current = result.isFullDocument;
        setGroups(result.groups);
        setOriginalHtml(html);
        setParseError('');
        setStep('edit');
        setPreviewHtml(getPreviewHtml(result.doc, result.isFullDocument));
        saveSession(html, result.groups);
      } catch {
        setParseError('Failed to parse the HTML. Please check the content and try again.');
      }
    },
    [],
  );

  const handleFieldChange = useCallback(
    (fieldId: string, value: string) => {
      if (!docRef.current) return;

      const dashIdx = fieldId.indexOf('-');
      const elementId = fieldId.substring(0, dashIdx);
      const property = fieldId.substring(dashIdx + 1);

      const element = docRef.current.querySelector(
        `[data-eid="${elementId}"]`,
      );
      if (!element) return;

      const isDangerousUrl =
        URL_PROPERTIES.has(property) && DANGEROUS_URL.test(value);

      if (property === 'textContent') {
        element.textContent = value;
      } else if (isDangerousUrl) {
        element.removeAttribute(property);
      } else {
        element.setAttribute(property, value);
      }

      setGroups((prev) => {
        const next = prev.map((group) => ({
          ...group,
          fields: group.fields.map((field) =>
            field.id === fieldId ? { ...field, value } : field,
          ),
        }));

        clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = setTimeout(() => {
          saveSession(originalHtml, next);
        }, 500);

        return next;
      });

      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = setTimeout(updatePreview, 300);
    },
    [updatePreview, originalHtml],
  );

  const handleExport = useCallback(() => {
    if (!docRef.current) return;
    setOutputHtml(
      serializeHtml(docRef.current, isFullDocRef.current, originalHtml),
    );
  }, [originalHtml]);

  const handleStartOver = useCallback(() => {
    clearSession();
    setStep('paste');
    setGroups([]);
    setPreviewHtml('');
    setOutputHtml(null);
    setOriginalHtml('');
    setParseError('');
    docRef.current = null;
  }, []);

  // Flush pending save before the tab closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (step === 'edit' && originalHtml) {
        clearTimeout(persistTimeoutRef.current);
        saveSession(originalHtml, groups);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step, originalHtml, groups]);

  useEffect(() => {
    return () => {
      clearTimeout(previewTimeoutRef.current);
      clearTimeout(persistTimeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 'paste' && (
        <PasteStep onParse={handleParse} error={parseError} />
      )}
      {step === 'edit' && (
        <EditStep
          groups={groups}
          previewHtml={previewHtml}
          onFieldChange={handleFieldChange}
          onExport={handleExport}
          onStartOver={handleStartOver}
        />
      )}
      {outputHtml !== null && (
        <OutputModal
          html={outputHtml}
          onClose={() => setOutputHtml(null)}
        />
      )}
    </div>
  );
}
