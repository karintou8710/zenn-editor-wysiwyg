import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import { renderTiptapEditor } from '../../../../tests/editor';
import { BlockMath } from '../block-math';
import { InlineMath } from '../inline-math';

const basicExtension = [Document, Paragraph, Text, BlockMath, InlineMath];

describe('BlockMath のレンダリング', () => {
  it('blockMathが正しいHTMLでレンダリングされる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<section><eqn><embed-katex display-mode="1">E = mc^2</embed-katex></eqn></section>',
    });

    const html = editor.getHTML();
    expect(html).toBe(
      '<section><eqn><embed-katex display-mode="1">E = mc^2</embed-katex></eqn></section>'
    );
  });

  it('空のlatex属性を持つblockMathが正しくレンダリングされる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<section><eqn><embed-katex display-mode="1"></embed-katex></eqn></section>',
    });

    const html = editor.getHTML();
    expect(html).toBe(
      '<section><eqn><embed-katex display-mode="1"></embed-katex></eqn></section>'
    );
  });

  it('HTMLにレンダリング後にパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<section><eqn><embed-katex display-mode="1">E = mc^2</embed-katex></eqn></section>',
    });

    const html = editor.getHTML();
    editor.commands.setContent(html);

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(blockMath)');
    expect(editor.state.doc.firstChild?.attrs.latex).toBe('E = mc^2');
  });
});

describe('InlineMath のレンダリング', () => {
  it('inlineMathが正しいHTMLでレンダリングされる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<p>質量エネルギー等価性は<embed-katex>E = mc^2</embed-katex>で表される</p>',
    });

    const html = editor.getHTML();
    expect(html).toBe(
      '<p>質量エネルギー等価性は<embed-katex>E = mc^2</embed-katex>で表される</p>'
    );
  });

  it('複数のinlineMath要素が正しくレンダリングされる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<p><embed-katex>x</embed-katex>と<embed-katex>y</embed-katex>の関係</p>',
    });

    const html = editor.getHTML();
    expect(html).toBe(
      '<p><embed-katex>x</embed-katex>と<embed-katex>y</embed-katex>の関係</p>'
    );
  });

  it('HTMLにレンダリング後にパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<p>質量エネルギー等価性は<embed-katex>E = mc^2</embed-katex>で表される</p>',
    });

    const html = editor.getHTML();
    editor.commands.setContent(html);

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(paragraph("質量エネルギー等価性は", inlineMath, "で表される"))'
    );
  });
});
