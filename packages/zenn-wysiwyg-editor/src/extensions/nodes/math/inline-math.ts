import { Node } from '@tiptap/react';

export const InlineMath = Node.create({
  name: 'inlineMath',
  group: 'inline',
  inline: true,
  atom: true,
  marks: '',

  addAttributes() {
    return {
      latex: {
        default: '',
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'embed-katex:not([display-mode])',
        getAttrs: (node) => {
          const latex = node.textContent ?? '';
          return { latex };
        },
      },
    ];
  },

  renderHTML({ node }) {
    return ['embed-katex', node.attrs.latex];
  },
});
