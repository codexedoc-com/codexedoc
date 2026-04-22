import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import ResizeImage from "tiptap-extension-resize-image";
import { useEffect, useRef } from "react";
import { FontSize } from "../lib/fontSizeExtension";
import "../styles/TipTapEditor.css";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

export default function TipTapEditor({ content, onChange, readOnly = false }: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: "tiptap-paragraph",
          },
        },
        heading: false, // remove headings and header blocks
      }),
      Image.configure({
        HTMLAttributes: {
          class: "tiptap-image",
        },
        inline: false,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ["paragraph"],
      }),
      TextStyle.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            fontSize: {
              default: null,
              parseHTML: (element) => element.style.fontSize || null,
              renderHTML: (attributes) => {
                if (!attributes.fontSize) {
                  return {};
                }
                return {
                  style: `font-size: ${attributes.fontSize}`,
                };
              },
            },
          };
        },
      }),
      FontSize,
      ResizeImage,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    // Always update if content has changed
    if (content !== currentHtml) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        if (editor && imageUrl) {
          editor.chain().focus().setImage({ src: imageUrl }).run();
          // Trigger onChange to save immediately
          setTimeout(() => {
            onChange(editor.getHTML());
          }, 100);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageButton = () => {
    fileInputRef.current?.click();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor-container">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={addImage}
        ref={fileInputRef}
        style={{ display: "none" }}
      />

      {!readOnly && (
        <div className="tiptap-toolbar">
          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`toolbar-button ${editor.isActive("bold") ? "active" : ""}`}
              title="Bold"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toolbar-icon">
                <path d="M7 4h5a4 4 0 0 1 0 8H7z" />
                <path d="M7 12h5a4 4 0 0 1 0 8H7z" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`toolbar-button ${editor.isActive("italic") ? "active" : ""}`}
              title="Italic"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toolbar-icon">
                <path d="M10 4h6" />
                <path d="M8 20h6" />
                <path d="M14 4L10 20" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`toolbar-button ${editor.isActive("strike") ? "active" : ""}`}
              title="Strikethrough"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toolbar-icon">
                <path d="M6 12h12" />
                <path d="M8 7h8" />
                <path d="M8 17h8" />
              </svg>
            </button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`toolbar-button ${editor.isActive("bulletList") ? "active" : ""}`}
              title="Bullet List"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toolbar-icon">
                <path d="M6 6h14" />
                <path d="M6 12h14" />
                <path d="M6 18h14" />
                <path d="M4 6h.01" />
                <path d="M4 12h.01" />
                <path d="M4 18h.01" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`toolbar-button ${editor.isActive("orderedList") ? "active" : ""}`}
              title="Ordered List"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toolbar-icon">
                <path d="M6 6h14" />
                <path d="M6 12h14" />
                <path d="M6 18h14" />
                <path d="M4 6v6" />
                <path d="M4 12h.01" />
                <path d="M4 18v.01" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`toolbar-button ${editor.isActive("blockquote") ? "active" : ""}`}
              title="Blockquote"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toolbar-icon">
                <path d="M7 8h10" />
                <path d="M7 12h10" />
                <path d="M7 16h10" />
                <path d="M5 5h2v14H5z" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`toolbar-button ${editor.isActive("codeBlock") ? "active" : ""}`}
              title="Code Block"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toolbar-icon">
                <path d="M8 9l-4 3 4 3" />
                <path d="M16 9l4 3-4 3" />
              </svg>
            </button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`toolbar-button ${editor.isActive({ textAlign: "left" }) ? "active" : ""}`}
              title="Align Left"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toolbar-icon">
                <path d="M4 6h16" />
                <path d="M4 12h12" />
                <path d="M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`toolbar-button ${editor.isActive({ textAlign: "center" }) ? "active" : ""}`}
              title="Align Center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toolbar-icon">
                <path d="M4 6h16" />
                <path d="M6 12h12" />
                <path d="M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`toolbar-button ${editor.isActive({ textAlign: "right" }) ? "active" : ""}`}
              title="Align Right"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toolbar-icon">
                <path d="M4 6h16" />
                <path d="M6 12h12" />
                <path d="M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              className={`toolbar-button ${editor.isActive({ textAlign: "justify" }) ? "active" : ""}`}
              title="Justify"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toolbar-icon">
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <select
              onChange={(e) => {
                const fontSize = e.target.value;
                if (fontSize) {
                  editor.chain().focus().setFontSize(fontSize).run();
                  // Reset dropdown after selection
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="toolbar-select"
              title="Text Size"
            >
              <option value="">Change size...</option>
              <option value="14px">Small</option>
              <option value="16px">Normal</option>
              <option value="18px">Medium</option>
              <option value="20px">Large</option>
              <option value="22px">X-Large</option>
              <option value="24px">Huge</option>
            </select>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <button
              onClick={handleImageButton}
              className="toolbar-button"
              title="Add Image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toolbar-icon">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              className="toolbar-button"
              title="Undo"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toolbar-icon">
                <path d="M9 19L4 14l5-5" />
                <path d="M4 14h16" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              className="toolbar-button"
              title="Redo"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toolbar-icon">
                <path d="M15 19l5-5-5-5" />
                <path d="M19 14H3" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  );
}
