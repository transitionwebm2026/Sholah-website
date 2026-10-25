import type {CSSProperties, ReactNode} from 'react';
import type {RichMark, RichNode} from '@/lib/cms/types';
import {cn} from '@/lib/utils';

/*
 * Renders article bodies stored as editor (Tiptap/ProseMirror) JSON. Only a known set of nodes
 * and marks is turned into React elements and no HTML string is ever injected, so content from
 * the dashboard cannot run scripts on the site. Unknown nodes render their children only.
 */

const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i;
const SAFE_SRC = /^(https?:\/\/|\/)/i;

function alignStyle(node: RichNode): CSSProperties | undefined {
  const align = node.attrs?.textAlign;
  return align === 'center' || align === 'right' || align === 'left' || align === 'justify' ? {textAlign: align} : undefined;
}

function applyMark(mark: RichMark, child: ReactNode, key: number): ReactNode {
  switch (mark.type) {
    case 'bold':
      return <strong key={key}>{child}</strong>;
    case 'italic':
      return <em key={key}>{child}</em>;
    case 'underline':
      return <u key={key}>{child}</u>;
    case 'strike':
      return <s key={key}>{child}</s>;
    case 'code':
      return <code key={key}>{child}</code>;
    case 'link': {
      const href = String(mark.attrs?.href ?? '');
      if (!SAFE_HREF.test(href)) return child;
      const external = /^https?:/i.test(href);
      return (
        <a key={key} href={href} {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}>
          {child}
        </a>
      );
    }
    default:
      return child;
  }
}

function renderNodes(nodes: RichNode[] | undefined): ReactNode {
  return nodes?.map((node, i) => renderNode(node, i));
}

function renderNode(node: RichNode, key: number): ReactNode {
  const children = renderNodes(node.content);
  switch (node.type) {
    case 'text':
      return (node.marks ?? []).reduce<ReactNode>((child, mark, i) => applyMark(mark, child, i), node.text ?? '');
    case 'paragraph':
      return (
        <p key={key} style={alignStyle(node)}>
          {children}
        </p>
      );
    case 'heading': {
      const level = Number(node.attrs?.level);
      const Tag = level === 3 ? 'h3' : level === 4 ? 'h4' : 'h2';
      return (
        <Tag key={key} style={alignStyle(node)}>
          {children}
        </Tag>
      );
    }
    case 'bulletList':
      return <ul key={key}>{children}</ul>;
    case 'orderedList':
      return (
        <ol key={key} start={Number(node.attrs?.start) || undefined}>
          {children}
        </ol>
      );
    case 'listItem':
      return <li key={key}>{children}</li>;
    case 'blockquote':
      return <blockquote key={key}>{children}</blockquote>;
    case 'codeBlock':
      return (
        <pre key={key} dir="ltr">
          <code>{children}</code>
        </pre>
      );
    case 'horizontalRule':
      return <hr key={key} />;
    case 'hardBreak':
      return <br key={key} />;
    case 'image': {
      const src = String(node.attrs?.src ?? '');
      if (!SAFE_SRC.test(src)) return null;
      return (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS images of unknown size
        <img key={key} src={src} alt={String(node.attrs?.alt ?? '')} loading="lazy" decoding="async" />
      );
    }
    default:
      return children ? <span key={key}>{children}</span> : null;
  }
}

export function RichText({doc, className}: {doc: RichNode | null | undefined; className?: string}) {
  if (!doc?.content?.length) return null;
  return <div className={cn('rich-text', className)}>{renderNodes(doc.content)}</div>;
}

/** Plain text of a document (reading time, search snippets). */
export function richTextToPlain(doc: RichNode | null | undefined): string {
  if (!doc) return '';
  if (doc.type === 'text') return doc.text ?? '';
  return (doc.content ?? []).map(richTextToPlain).join(doc.type === 'doc' ? '\n' : ' ');
}
