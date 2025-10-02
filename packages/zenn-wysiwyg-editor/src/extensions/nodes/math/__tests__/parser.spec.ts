import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import { renderTiptapEditor } from '../../../../tests/editor';
import { BlockMath } from '../block-math';
import { InlineMath } from '../inline-math';

const basicExtension = [Document, Paragraph, Text, BlockMath, InlineMath];

describe('BlockMath のパース', () => {
  it('embed-katex[display-mode="1"]をblockMathノードとしてパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<section><eqn><embed-katex display-mode="1">E = mc^2</embed-katex></eqn></section>',
    });

    const docString = editor.state.doc.toString();

    expect(docString).toBe('doc(blockMath)');
    expect(editor.state.doc.firstChild?.attrs.latex).toBe('E = mc^2');
  });

  it('空のlatex属性を持つblockMathをパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<section><eqn><embed-katex display-mode="1"></embed-katex></eqn></section>',
    });

    const docString = editor.state.doc.toString();

    expect(docString).toBe('doc(blockMath)');
    expect(editor.state.doc.firstChild?.attrs.latex).toBe('');
  });
});

describe('InlineMath のパース', () => {
  it('embed-katex(display-mode属性なし)をinlineMathノードとしてパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<p>質量エネルギー等価性は<embed-katex>E = mc^2</embed-katex>で表される</p>',
    });

    const docString = editor.state.doc.toString();

    expect(docString).toBe(
      'doc(paragraph("質量エネルギー等価性は", inlineMath, "で表される"))'
    );
    expect(editor.state.doc.firstChild?.children[1].attrs.latex).toBe(
      'E = mc^2'
    );
  });

  it('複数のinlineMath要素を含むパラグラフをパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<p><embed-katex>x</embed-katex>と<embed-katex>y</embed-katex>の関係</p>',
    });

    const docString = editor.state.doc.toString();

    expect(docString).toBe(
      'doc(paragraph(inlineMath, "と", inlineMath, "の関係"))'
    );
  });
});
