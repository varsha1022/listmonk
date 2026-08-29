const markdownToVisualBlock = (markdown) => {
  const lines = markdown.split('\n');
  const blocks = [];
  const idBase = Date.now();
  let textBuf = [];

  const createBlock = (type, props, style = {}) => ({
    id: `block-${idBase + blocks.length}`,
    type,
    data: {
      props,
      style: {
        padding: {
          top: 16, bottom: 16, right: 24, left: 24,
        },
        ...style,
      },
    },
  });

  const flushText = () => {
    if (textBuf.length > 0) {
      blocks.push(createBlock('Text', { markdown: true, text: textBuf.join('\n') }));

      textBuf = [];
    }
  };

  lines.forEach((line) => {
    // Handle ATX headings (# Heading)
    let heading = null;
    if (line && line[0] === '#') {
      let hashCount = 0;
      while (hashCount < line.length && line[hashCount] === '#') hashCount++;
      if (hashCount > 0 && hashCount < line.length && line[hashCount] === ' ') {
        heading = { level: Math.min(hashCount, 6), text: line.slice(hashCount + 1) };
      }
    }
    if (heading) {
      flushText();

      blocks.push(createBlock('Heading', {
        text: heading.text,
        level: `h${heading.level}`,
      }));
      return;
    }

    // Handle Setext headings (===== or -----)
    const trimmed = line.trim();
    if (trimmed.length > 0 && textBuf.length > 0) {
      const ch = trimmed[0];
      let allSame = true;
      for (let i = 0; i < trimmed.length; i++) {
        if (trimmed[i] !== ch) { allSame = false; break; }
      }
      if (allSame && (ch === '=' || ch === '-')) {
      const lastLine = textBuf.pop();
      if (lastLine.trim()) {
        flushText();

        blocks.push(createBlock('Heading', {
          text: lastLine,
          level: trimmed[0] === '=' ? 'h1' : 'h2',
        }));

        return;
      }

      textBuf.push(lastLine, line);
    } else {
      textBuf.push(line);
    }
  });

  flushText();

  return {
    root: {
      type: 'EmailLayout',
      data: { childrenIds: blocks.map((b) => b.id) },
    },
    ...Object.fromEntries(blocks.map((b) => [b.id, { type: b.type, data: b.data }])),
  };
};

export default markdownToVisualBlock;
