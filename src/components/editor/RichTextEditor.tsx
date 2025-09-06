// src/components/editor/RichTextEditor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Toggle } from '@/components/ui/toggle';
import { Bold, Italic, Strikethrough } from 'lucide-react';
import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface RichTextEditorProps {
  content: any;
  onUpdate: (newContent: any) => void;
}

const EditorToolbar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-t-md p-2 flex gap-1">
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
    </div>
  );
};

export function RichTextEditor({ content, onUpdate }: RichTextEditorProps) {
  const debouncedUpdate = useDebouncedCallback(onUpdate, 1000);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[100px]',
      },
    },
    onUpdate: ({ editor }) => {
      debouncedUpdate(editor.getJSON());
    },
  });

  // Effect to update content from the server if it changes
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const isSame = JSON.stringify(editor.getJSON()) === JSON.stringify(content);
      if (!isSame) {
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor]);

  return (
    <div className="border rounded-md">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}