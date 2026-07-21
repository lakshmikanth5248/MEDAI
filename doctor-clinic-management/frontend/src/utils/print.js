function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const BASE_STYLES = `
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', serif; color: #000; padding: 40px; margin: 0; }
  h1, h2, h3, h4 { color: #1a365d; margin: 0 0 6px; }
  .doc-header { text-align: center; margin-bottom: 10px; }
  .doc-header h2 { font-size: 24px; margin: 0; }
  .doc-header p { margin: 2px 0; font-size: 12px; color: #555; }
  .doc-brand { display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
  .doc-brand svg { vertical-align: middle; }
  .divider { border-top: 2px solid #333; margin: 12px 0; }
  .title { text-align: center; font-size: 20px; font-weight: bold; letter-spacing: 4px; color: #1a365d; margin: 8px 0; }
  .meta { display: flex; justify-content: space-between; font-size: 13px; margin: 6px 0; }
  .section { margin: 10px 0; }
  .section h4 { border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 6px; }
  .section p { margin: 4px 0; font-size: 13px; white-space: pre-wrap; }
  .row { display: flex; gap: 8px; font-size: 13px; margin: 2px 0; }
  .row .k { min-width: 130px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 12px; }
  th { background: #f0f0f0; border: 1px solid #ccc; padding: 6px 8px; text-align: left; font-weight: 600; }
  td { border: 1px solid #ccc; padding: 5px 8px; vertical-align: top; }
  .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; }
  .sig .sig-line { width: 200px; border-top: 1px solid #000; margin-bottom: 4px; }
  .sig p { margin: 0; font-size: 12px; color: #555; }
  .note { font-size: 11px; color: #888; }
  @media print { body { padding: 20px; } }
`;

export function printDocument(title, bodyHtml) {
  const doc = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>${BASE_STYLES}</style>
  </head>
  <body>${bodyHtml}</body>
</html>`;

  // Self-contained Blob URL opens reliably in a new tab even when
  // blank window.open targets are blocked, and supports "Save as PDF".
  const blob = new Blob([doc], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    const trigger = () => { try { win.focus(); win.print(); } catch { /* noop */ } };
    if (win.document.readyState === 'complete') setTimeout(trigger, 300);
    else win.onload = () => setTimeout(trigger, 300);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return;
  }

  // Last resort: trigger a direct download of the HTML file.
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function escapeHtmlValue(value) {
  return escapeHtml(value);
}
