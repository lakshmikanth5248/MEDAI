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
`;

export function printDocument(title, bodyHtml) {
  const win = window.open('', '_blank', 'width=800,height=600');
  if (!win) {
    alert('Please allow pop-ups in your browser to enable printing.');
    return;
  }
  const doc = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>${BASE_STYLES}</style>
  </head>
  <body>${bodyHtml}</body>
</html>`;
  win.document.open();
  win.document.write(doc);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 350);
}

export function escapeHtmlValue(value) {
  return escapeHtml(value);
}
