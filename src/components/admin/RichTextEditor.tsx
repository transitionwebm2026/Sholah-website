'use client';

import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import {EditorContent, useEditor, useEditorState, type Editor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
  Unlink
} from 'lucide-react';
import {useRef, useState, type ReactNode} from 'react';
import {prepareImage, uploadFile} from '@/lib/admin/upload';
import type {RichNode} from '@/lib/cms/types';
import {cn} from '@/lib/utils';
import {useToast} from './ui';

type Props = {
  value: RichNode | null;
  onChange: (doc: RichNode) => void;
  dir: 'rtl' | 'ltr';
  /** Accessible name of the editing area. */
  label: string;
};

/**
 * WYSIWYG article editor (Tiptap). Content is saved as editor JSON, which the site renders with a
 * strict allow-list (components/ui/RichText.tsx) — no raw HTML ever reaches visitors. The editing
 * area uses the site's own article styles on a light page so authors see the published result.
 */
export function RichTextEditor({value, onChange, dir, label}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {levels: [2, 3, 4]},
        codeBlock: false,
        link: {openOnClick: false, autolink: true, defaultProtocol: 'https'}
      }),
      Image.configure({inline: false}),
      TextAlign.configure({types: ['heading', 'paragraph']})
    ],
    content: value ?? '',
    editorProps: {
      attributes: {
        dir,
        'aria-label': label,
        'aria-multiline': 'true',
        role: 'textbox',
        class: 'rich-text min-h-[26rem] px-6 py-6 text-lg leading-[1.9] text-slate-700 focus:outline-none sm:px-10'
      }
    },
    onUpdate: ({editor}) => onChange(editor.getJSON() as RichNode)
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      {editor && <Toolbar editor={editor} />}
      <div className="max-h-[70vh] overflow-y-auto bg-ivory">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({editor}: {editor: Editor}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const state = useEditorState({
    editor,
    selector: ({editor: e}) => ({
      h2: e.isActive('heading', {level: 2}),
      h3: e.isActive('heading', {level: 3}),
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      quote: e.isActive('blockquote'),
      link: e.isActive('link'),
      right: e.isActive({textAlign: 'right'}),
      center: e.isActive({textAlign: 'center'}),
      left: e.isActive({textAlign: 'left'}),
      canUndo: e.can().undo(),
      canRedo: e.can().redo()
    })
  });

  function setLink() {
    const previous = (editor.getAttributes('link').href as string | undefined) ?? '';
    const url = window.prompt('رابط (https://… أو /ar/contact):', previous);
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({href: url.trim()}).run();
  }

  async function insertImage(file: File) {
    setUploading(true);
    try {
      const url = await uploadFile('images', 'articles/inline', await prepareImage(file, 1600));
      const alt = window.prompt('وصف قصير للصورة (للقراء ومحركات البحث):', '') ?? '';
      editor.chain().focus().setImage({src: url, alt}).run();
    } catch (error) {
      toast(error instanceof Error ? error.message : String(error), 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const chain = () => editor.chain().focus();

  return (
    <div role="toolbar" aria-label="تنسيق النص" className="flex flex-wrap items-center gap-0.5 border-b border-white/10 bg-navy-950 px-2 py-1.5">
      <Tool label="عنوان رئيسي" active={state.h2} onClick={() => chain().toggleHeading({level: 2}).run()}>
        <Heading2 />
      </Tool>
      <Tool label="عنوان فرعي" active={state.h3} onClick={() => chain().toggleHeading({level: 3}).run()}>
        <Heading3 />
      </Tool>
      <Sep />
      <Tool label="عريض" active={state.bold} onClick={() => chain().toggleBold().run()}>
        <Bold />
      </Tool>
      <Tool label="مائل" active={state.italic} onClick={() => chain().toggleItalic().run()}>
        <Italic />
      </Tool>
      <Tool label="تسطير" active={state.underline} onClick={() => chain().toggleUnderline().run()}>
        <Underline />
      </Tool>
      <Tool label="يتوسطه خط" active={state.strike} onClick={() => chain().toggleStrike().run()}>
        <Strikethrough />
      </Tool>
      <Sep />
      <Tool label="قائمة نقطية" active={state.bullet} onClick={() => chain().toggleBulletList().run()}>
        <List />
      </Tool>
      <Tool label="قائمة مرقّمة" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}>
        <ListOrdered />
      </Tool>
      <Tool label="اقتباس" active={state.quote} onClick={() => chain().toggleBlockquote().run()}>
        <Quote />
      </Tool>
      <Tool label="خط فاصل" onClick={() => chain().setHorizontalRule().run()}>
        <Minus />
      </Tool>
      <Sep />
      <Tool label="محاذاة لليمين" active={state.right} onClick={() => chain().setTextAlign('right').run()}>
        <AlignRight />
      </Tool>
      <Tool label="توسيط" active={state.center} onClick={() => chain().setTextAlign('center').run()}>
        <AlignCenter />
      </Tool>
      <Tool label="محاذاة لليسار" active={state.left} onClick={() => chain().setTextAlign('left').run()}>
        <AlignLeft />
      </Tool>
      <Sep />
      <Tool label="إضافة رابط" active={state.link} onClick={setLink}>
        <Link2 />
      </Tool>
      {state.link && (
        <Tool label="إزالة الرابط" onClick={() => chain().extendMarkRange('link').unsetLink().run()}>
          <Unlink />
        </Tool>
      )}
      <Tool label={uploading ? 'جارٍ رفع الصورة…' : 'إدراج صورة'} disabled={uploading} onClick={() => fileRef.current?.click()}>
        <ImagePlus className={uploading ? 'animate-pulse' : undefined} />
      </Tool>
      <Tool label="إزالة التنسيق" onClick={() => chain().unsetAllMarks().clearNodes().run()}>
        <RemoveFormatting />
      </Tool>
      <Sep />
      <Tool label="تراجع" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
        <Undo2 className="rtl:-scale-x-100" />
      </Tool>
      <Tool label="إعادة" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
        <Redo2 className="rtl:-scale-x-100" />
      </Tool>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void insertImage(file);
        }}
      />
    </div>
  );
}

function Tool({label, active, disabled, onClick, children}: {label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'grid size-9 place-items-center rounded-lg transition [&_svg]:size-4 disabled:opacity-30',
        active ? 'bg-gold-400 text-navy-950' : 'text-white/75 hover:bg-white/10 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span aria-hidden className="mx-1 h-6 w-px bg-white/10" />;
}
