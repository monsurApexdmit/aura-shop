import { cn } from "@/lib/utils"
import { Fragment, type ReactNode } from "react";

// Tiny, safe Markdown renderer: builds React elements only (no innerHTML), so any raw HTML in the
// source is shown as text. Supports #/##/### headings, paragraphs, - / * / 1. lists, **bold**, _italic_,
// `code`, and [text](url) links (http, https, mailto, tel or site-relative only).

const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/(?!\/))/i;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*(.+?)\*\*|`([^`]+)`|(?<![A-Za-z0-9])_(.+?)_(?![A-Za-z0-9])|\*(.+?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${i++}`;
    if (m[1] !== undefined) {
      out.push(
        SAFE_URL.test(m[2]) ? (
          <a key={key} href={m[2]} className="text-primary underline" target={m[2].startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer">
            {m[1]}
          </a>
        ) : (
          m[0]
        ),
      );
    } else if (m[3] !== undefined) out.push(<strong key={key}>{renderInline(m[3], key)}</strong>);
    else if (m[4] !== undefined) out.push(<code key={key} className="rounded bg-muted px-1 py-0.5 text-sm">{m[4]}</code>);
    else out.push(<em key={key}>{renderInline((m[5] ?? m[6]) as string, key)}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const lines = (source || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) {
      const k = `p${blocks.length}`;
      blocks.push(<p key={k} className="text-muted-foreground leading-relaxed mb-4">{renderInline(para.join(" "), k)}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const k = `l${blocks.length}`;
      const items = list.items.map((it, n) => <li key={n}>{renderInline(it, `${k}-${n}`)}</li>);
      blocks.push(
        list.ordered ? (
          <ol key={k} className="list-decimal pl-6 mb-4 space-y-1 text-muted-foreground">{items}</ol>
        ) : (
          <ul key={k} className="list-disc pl-6 mb-4 space-y-1 text-muted-foreground">{items}</ul>
        ),
      );
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushPara(); flushList(); continue; }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      flushPara(); flushList();
      const k = `h${blocks.length}`;
      const cls = h[1].length === 1 ? "text-3xl" : h[1].length === 2 ? "text-2xl" : "text-xl";
      blocks.push(<h2 key={k} className={cn("font-display font-bold text-foreground mt-6 mb-3", cls)}>{renderInline(h[2], k)}</h2>);
      continue;
    }
    const li = /^\s*(?:([-*])|(\d+)\.)\s+(.*)$/.exec(line);
    if (li) {
      flushPara();
      const ordered = !!li[2];
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push(li[3]);
      continue;
    }
    flushList();
    para.push(line.trim());
  }
  flushPara(); flushList();
  return <div className={className}>{blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</div>;
}

export default Markdown;
