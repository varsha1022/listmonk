import React, { useEffect, useState } from 'react';

import { html, json } from './highlighters';

type TextEditorPanelProps = {
  type: 'json' | 'html' | 'javascript';
  value: string;
};
export default function HighlightedCodePanel({ type, value }: TextEditorPanelProps) {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (type === 'html') {
      html(value).then(setCode);
      return;
    }
    if (type === 'json') {
      json(value).then(setCode);
      return;
    }
    // For unknown types fall back to treating the value as plain text
    setCode(String(value));
  }, [setCode, value, type]);

  if (code === null) {
    return null;
  }

  return (
    <pre
      style={{ margin: 0, padding: 16, height: '100%', overflow: 'auto' }}
      dangerouslySetInnerHTML={{ __html: code }}
      onClick={(ev) => {
        const s = window.getSelection();
        if (s === null) {
          return;
        }
        s.selectAllChildren(ev.currentTarget);
      }}
    />
  );
}
