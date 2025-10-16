import { Node } from '@tiptap/react';

export const BlockMath = Node.create({
  name: 'blockMath',
  group: 'block',
  atom: true,
  marks: '',

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    };
  },

  // section と eqn は BlockMath でのみ使用されるタグなので、セレクタには含めないでも問題ない
  parseHTML() {
    return [
      {
        tag: 'embed-katex[display-mode="1"]',
        getAttrs: (node) => {
          const latex = node.textContent?.trim() ?? '';
          return { latex };
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'section',
      ['eqn', ['embed-katex', { 'display-mode': '1' }, node.attrs.latex]],
    ];
  },
});
