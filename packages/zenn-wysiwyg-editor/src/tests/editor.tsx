import { Editor, type Extensions } from '@tiptap/react';
import { render } from 'vitest-browser-react';
import EditorContent from '../components/editor/editor-content';

type RenderTiptapEditor = {
  content: string;
  extensions: Extensions;
};

export function renderTiptapEditor({
  content,
  extensions,
}: RenderTiptapEditor) {
  const editor = new Editor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class: 'znc',
      },
    },
  });

  render(<EditorContent editor={editor} />);

  return editor;
}
