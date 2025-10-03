import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { userEvent } from '@vitest/browser/context';
import { InlineMath } from '../inline-math';
import { renderTiptapEditor } from '../../../../tests/editor';
import { describe, expect, it } from 'vitest';
import { waitSelectionChange } from '../../../../tests/dom';

const basicExtension = [Document, Paragraph, Text, InlineMath, HardBreak];

describe('キーボードショートカット', () => {
  describe('Backspace', () => {
    it('1文字テキスト + 数式ノードの真ん中で削除', async () => {
      const editor = renderTiptapEditor({
        content: '<p>t<embed-katex>e</embed-katex></p>',
        extensions: basicExtension,
      });

      await waitSelectionChange(() => {
        editor.chain().focus().setTextSelection(2).run();
      });
      await userEvent.keyboard('{Backspace}');

      const docString = editor.state.doc.toString();
      expect(docString).toBe('doc(paragraph(inlineMath))');
      expect(editor.state.selection.from).toBe(1);
    });

    it('途中の 1文字テキスト + 数式ノードの真ん中で削除', async () => {
      const editor = renderTiptapEditor({
        content:
          '<p>t<embed-katex>e</embed-katex>t<embed-katex>e</embed-katex></p>',
        extensions: basicExtension,
      });

      await waitSelectionChange(() => {
        editor.chain().focus().setTextSelection(4).run();
      });
      await userEvent.keyboard('{Backspace}');

      const docString = editor.state.doc.toString();
      expect(docString).toBe('doc(paragraph("t", inlineMath, inlineMath))');
      expect(editor.state.selection.from).toBe(3);
    });
  });
});
