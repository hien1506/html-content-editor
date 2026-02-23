import { useState, useRef, useCallback, useEffect } from 'react';
import { parseHtml } from './lib/parser';
import { serializeHtml, getPreviewHtml } from './lib/serializer';
import type { FieldGroup } from './lib/types';

const DANGEROUS_URL = /^\s*(javascript|data|vbscript)\s*:/i;
const URL_PROPERTIES = new Set(['href', 'src', 'srcset']);
import PasteStep from './components/PasteStep';
import EditStep from './components/EditStep';
import OutputModal from './components/OutputModal';

export default function App() {
  const [step, setStep] = useState<'paste' | 'edit'>('paste');
  const [groups, setGroups] = useState<FieldGroup[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [outputHtml, setOutputHtml] = useState<string | null>(null);
  const [originalHtml, setOriginalHtml] = useState('');
  const [parseError, setParseError] = useState('');

  const docRef = useRef<Document | null>(null);
  const isFullDocRef = useRef(false);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          fields: group.fields.map((field) =>
            field.id === fieldId ? { ...field, value } : field,
          ),
        })),
      );

      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = setTimeout(updatePreview, 300);
    },
    [updatePreview],
  );

  const handleExport = useCallback(() => {
    if (!docRef.current) return;
    setOutputHtml(
      serializeHtml(docRef.current, isFullDocRef.current, originalHtml),
    );
  }, [originalHtml]);

  const handleStartOver = useCallback(() => {
    setStep('paste');
    setGroups([]);
    setPreviewHtml('');
    setOutputHtml(null);
    setOriginalHtml('');
    setParseError('');
    docRef.current = null;
  }, []);

  useEffect(() => {
    return () => clearTimeout(previewTimeoutRef.current);
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
