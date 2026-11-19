import React from 'react';

// Renderer Markdown ringan untuk keluaran AI (judul, daftar, tebal, kode, kutipan).
function inline(text, keyBase) {
  const parts = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${keyBase}-${i++}`;
    if (tok.startsWith('**')) parts.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) parts.push(<code key={k}>{tok.slice(1, -1)}</code>);
    else parts.push(<em key={k}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function Markdown({ text = '', className = '' }) {
  const lines = text.replace(/\r/g, '').split('\n');
  const blocks = [];
  let list = null;
  let para = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', text: para.join(' ') });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) { flushPara(); flushList(); continue; }

    const h = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushPara(); flushList();
      blocks.push({ type: h[1].length <= 2 ? 'h2' : 'h3', text: h[2] });
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) { flushPara(); flushList(); continue; }
    if (trimmed.startsWith('>')) {
      flushPara(); flushList();
      blocks.push({ type: 'quote', text: trimmed.replace(/^>\s?/, '') });
      continue;
    }
    const ul = trimmed.match(/^[-*•]\s+(.*)$/);
    const ol = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (ul || ol) {
      flushPara();
      const type = ul ? 'ul' : 'ol';
      if (!list || list.type !== type) { flushList(); list = { type, items: [] }; }
      list.items.push((ul || ol)[1]);
      continue;
    }
    if (list && /^\s{2,}/.test(raw)) {
      list.items[list.items.length - 1] += ` ${trimmed}`;
      continue;
    }
    flushList();
    para.push(trimmed);
  }
  flushPara();
  flushList();

  return (
    <div className={`ai-prose text-[13px] text-slate-700 ${className}`}>
      {blocks.map((b, i) => {
        if (b.type === 'h2') return <h2 key={i}>{inline(b.text, i)}</h2>;
        if (b.type === 'h3') return <h3 key={i}>{inline(b.text, i)}</h3>;
        if (b.type === 'quote') return <blockquote key={i}>{inline(b.text, i)}</blockquote>;
        if (b.type === 'ul' || b.type === 'ol') {
          const Tag = b.type;
          return <Tag key={i}>{b.items.map((it, j) => <li key={j}>{inline(it, `${i}-${j}`)}</li>)}</Tag>;
        }
        return <p key={i}>{inline(b.text, i)}</p>;
      })}
    </div>
  );
}
