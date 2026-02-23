export function serializeHtml(
  doc: Document,
  isFullDocument: boolean,
  originalHtml: string,
): string {
  const clone = doc.cloneNode(true) as Document;
  clone.querySelectorAll('[data-eid]').forEach((el) =>
    el.removeAttribute('data-eid'),
  );

  if (isFullDocument) {
    let html = clone.documentElement.outerHTML;
    const hasDoctype = /^\s*<!doctype/i.test(originalHtml);
    if (hasDoctype) {
      const match = originalHtml.match(/^\s*(<!doctype[^>]*>)/i);
      html = (match?.[1] ?? '<!DOCTYPE html>') + '\n' + html;
    }
    return html;
  }

  return clone.body.innerHTML;
}

const PREVIEW_CSP =
  '<meta http-equiv="Content-Security-Policy" content="script-src \'none\'; object-src \'none\';">';

export function getPreviewHtml(
  doc: Document,
  isFullDocument: boolean,
): string {
  const clone = doc.cloneNode(true) as Document;
  clone.querySelectorAll('[data-eid]').forEach((el) =>
    el.removeAttribute('data-eid'),
  );

  if (isFullDocument) {
    const head = clone.querySelector('head');
    if (head) {
      head.insertAdjacentHTML('afterbegin', PREVIEW_CSP);
    }
    return '<!DOCTYPE html>\n' + clone.documentElement.outerHTML;
  }

  return [
    `<!DOCTYPE html><html><head><meta charset="UTF-8">${PREVIEW_CSP}</head><body>`,
    clone.body.innerHTML,
    '</body></html>',
  ].join('');
}
