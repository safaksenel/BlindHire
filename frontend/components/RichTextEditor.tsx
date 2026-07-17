"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Palette
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const PREDEFINED_COLORS = [
  '#FFFFFF', '#A1A1AA', '#EF4444', '#F97316', '#F59E0B', 
  '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [hexInput, setHexInput] = useState('');
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false, 
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: placeholder || 'İçerik buraya...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[200px] p-4 text-zinc-300',
      },
    },
  });

  // Handle click outside for color picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update editor content if value changes externally (e.g. initial load)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const applyColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  const handleHexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let color = hexInput;
    if (!color.startsWith('#')) color = '#' + color;
    applyColor(color);
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40 focus-within:border-theme-1/50 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 p-2 bg-white/[0.02]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('bold') ? 'bg-white/10 text-white' : 'text-zinc-400'}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('italic') ? 'bg-white/10 text-white' : 'text-zinc-400'}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('underline') ? 'bg-white/10 text-white' : 'text-zinc-400'}`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-white/10 text-white' : 'text-zinc-400'}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-white/10 text-white' : 'text-zinc-400'}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('bulletList') ? 'bg-white/10 text-white' : 'text-zinc-400'}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('orderedList') ? 'bg-white/10 text-white' : 'text-zinc-400'}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Color Picker */}
        <div className="relative" ref={colorPickerRef}>
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 flex items-center gap-1.5"
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
            <div 
              className="w-3 h-3 rounded-full border border-white/20" 
              style={{ backgroundColor: editor.getAttributes('textStyle').color || '#ffffff' }}
            />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-3 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-50 w-48">
              <div className="mb-3">
                <p className="text-xs text-zinc-400 mb-2 font-medium">Standard Colors</p>
                <div className="flex flex-wrap gap-1.5">
                  {PREDEFINED_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => applyColor(color)}
                      className="w-6 h-6 rounded-md border border-white/10 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <form onSubmit={handleHexSubmit}>
                <p className="text-xs text-zinc-400 mb-2 font-medium">Custom HEX</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => setHexInput(e.target.value)}
                    placeholder="#FFFFFF"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-theme-1"
                  />
                  <button 
                    type="submit"
                    className="px-2 py-1 bg-theme-1/10 hover:bg-theme-1/20 text-theme-1 rounded-lg text-xs font-semibold transition-colors"
                  >
                    OK
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <style dangerouslySetInnerHTML={{__html: `
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #52525b; /* zinc-600 */
          pointer-events: none;
          height: 0;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror li p {
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }
      `}} />
      <EditorContent editor={editor} />
    </div>
  );
}
