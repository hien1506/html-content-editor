import { useMemo } from "react";

interface PreviewPanelProps {
  html: string;
}

export default function PreviewPanel({ html }: PreviewPanelProps) {
  const srcDoc = useMemo(() => {
    const baseTag = '<base target="_blank">';
    if (/<head[\s>]/i.test(html)) {
      return html.replace(/(<head[\s>][^]*?>)/i, `$1${baseTag}`);
    }
    return `${baseTag}${html}`;
  }, [html]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center border-b border-gray-200 px-4 py-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Preview
        </h2>
      </div>
      <iframe
        srcDoc={srcDoc}
        title="HTML Preview"
        sandbox="allow-popups allow-popups-to-escape-sandbox"
        className="flex-1 w-full"
      />
    </div>
  );
}
