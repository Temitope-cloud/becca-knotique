"use client";

import { useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
} from "lucide-react";
import { PROSE_CLASS } from "@/lib/prose";

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition ${
        active
          ? "bg-stone-900 text-white"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  // In-app prompt (no native window.prompt). `kind` picks link vs image.
  const [prompt, setPrompt] = useState<{
    kind: "link" | "image";
    value: string;
  } | null>(null);

  const openLink = () => {
    const prev = (editor.getAttributes("link").href as string | undefined) ?? "";
    setPrompt({ kind: "link", value: prev || "https://" });
  };

  const openImage = () => setPrompt({ kind: "image", value: "https://" });

  const applyPrompt = () => {
    if (!prompt) return;
    const url = prompt.value.trim();
    if (prompt.kind === "link") {
      if (!url) {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      } else {
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }
    } else if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setPrompt(null);
  };

  return (
    <>
    <div className="flex flex-wrap items-center gap-1 border-b border-stone-200 bg-stone-50 p-1.5">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        label="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-stone-200" />
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        active={editor.isActive("heading", { level: 2 })}
        label="Heading"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        active={editor.isActive("heading", { level: 3 })}
        label="Subheading"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="Quote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-stone-200" />
      <ToolbarButton onClick={openLink} active={editor.isActive("link")} label="Link">
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={openImage} label="Image">
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-stone-200" />
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        label="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        label="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>

    {prompt ? (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-xl">
          <h3 className="text-sm font-semibold text-stone-900">
            {prompt.kind === "link" ? "Add a link" : "Add an image"}
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            {prompt.kind === "link"
              ? "Paste a web address. Leave empty to remove the link."
              : "Paste an image URL (Cloudinary or any https link)."}
          </p>
          <input
            autoFocus
            type="url"
            value={prompt.value}
            onChange={(e) => setPrompt({ ...prompt, value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyPrompt();
              } else if (e.key === "Escape") {
                setPrompt(null);
              }
            }}
            placeholder="https://"
            className="mt-3 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPrompt(null)}
              className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyPrompt}
              className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              {prompt.kind === "link" ? "Add link" : "Add image"}
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false, // avoid Next SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false },
      }),
      Image,
      Placeholder.configure({ placeholder: "Write your story…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: `${PROSE_CLASS} min-h-[320px] px-4 py-3 outline-none`,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-stone-300 focus-within:border-stone-900 focus-within:ring-2 focus-within:ring-stone-900/10">
      {editor ? <Toolbar editor={editor} /> : null}
      <EditorContent editor={editor} />
    </div>
  );
}
