import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import { convertMarkdownToEditable } from '../../../../lib/from-markdown';
import { markdownSerializer } from '../../../../lib/to-markdown';
import { createTiptapEditor } from '../../../../tests/node/editor';
import { BlockMath } from '../block-math';
import { InlineMath } from '../inline-math';

const basicExtension = [Document, Paragraph, Text, BlockMath, InlineMath];

describe('BlockMath のマークダウン', () => {
  it('blockMathノードをマークダウンに変換できる', () => {
    const editor = createTiptapEditor({
      extensions: basicExtension,
      content:
        '<section><eqn><embed-katex display-mode="1">E = mc^2</embed-katex></eqn></section>',
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);

    expect(markdown).toBe('$$\nE = mc^2\n$$');
  });

  it('空のlatex属性を持つblockMathをマークダウンに変換できる', () => {
    const editor = createTiptapEditor({
      extensions: basicExtension,
      content:
        '<section><eqn><embed-katex display-mode="1"></embed-katex></eqn></section>',
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);

    expect(markdown).toBe('$$\n\n$$');
  });

  it('マークダウンからblockMathノードに変換', () => {
    const markdown = '$$\nE = mc^2\n$$';

    const html = convertMarkdownToEditable(markdown);
    const editor = createTiptapEditor({
      extensions: basicExtension,
      content: html,
    });
    const docString = editor.state.doc.toString();

    expect(docString).toBe('doc(blockMath)');
    expect(editor.state.doc.firstChild?.attrs.latex).toBe('E = mc^2');
  });
});

describe('InlineMath のマークダウン', () => {
  it('inlineMathノードをマークダウンに変換できる', () => {
    const editor = createTiptapEditor({
      extensions: basicExtension,
      content:
        '<p>質量エネルギー等価性は<embed-katex>E = mc^2</embed-katex>で表される</p>',
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);

    expect(markdown).toBe('質量エネルギー等価性は$E = mc^2$で表される');
  });

  it('複数のinlineMathノードをマークダウンに変換できる', () => {
    const editor = createTiptapEditor({
      extensions: basicExtension,
      content:
        '<p><embed-katex>x</embed-katex>と<embed-katex>y</embed-katex>の関係</p>',
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);

    expect(markdown).toBe('$x$と$y$の関係');
  });

  it('マークダウンからinlineMathノードに変換', () => {
    const markdown = '質量エネルギー等価性は$E = mc^2$で表される';

    const html = convertMarkdownToEditable(markdown);
    const editor = createTiptapEditor({
      extensions: basicExtension,
      content: html,
    });
    const docString = editor.state.doc.toString();

    expect(docString).toBe(
      'doc(paragraph("質量エネルギー等価性は", inlineMath, "で表される"))'
    );
    expect(editor.state.doc.firstChild?.child(1).attrs.latex).toBe('E = mc^2');
  });
});
