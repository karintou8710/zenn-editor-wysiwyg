import { Editor, type Extensions } from '@tiptap/react';
import { afterEach, beforeEach } from 'vitest';

// テスト毎に描画するDOMをリセットする
let ___global_container: HTMLElement | null = null;
let ___global_rendered_editor: Editor | null = null;

beforeEach(() => {
  ___global_container = document.createElement('div');
  document.body.appendChild(___global_container);
  ___global_rendered_editor?.destroy();
});

afterEach(async () => {
  ___global_rendered_editor?.destroy();
  if (___global_container) {
    document.body.removeChild(___global_container);
  }
});

type RenderTiptapEditor = {
  content: string;
  extensions: Extensions;
};

export function renderTiptapEditor({
  content,
  extensions,
}: RenderTiptapEditor) {
  ___global_rendered_editor = new Editor({
    element: ___global_container,
    extensions,
    content,
    editorProps: {
      attributes: {
        class: 'znc',
      },
    },
  });

  return ___global_rendered_editor;
}
