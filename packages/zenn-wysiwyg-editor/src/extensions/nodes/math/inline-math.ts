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
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'embed-katex:not([display-mode])',
        getAttrs: (node) => {
          const latex = node.textContent?.trim() ?? '';
          return { latex };
        },
      },
    ];
  },

  renderHTML({ node }) {
    return ['embed-katex', node.attrs.latex];
  },

  addKeyboardShortcuts() {
    return {
      // 1文字のテキストノード + インライン数式ノードが並ぶと、その間でBackspaceが機能しない.
      // 原因はブラウザのBackspaceの挙動に依存していそうなので、Tiptap側でBackspaceをハンドリングして対応する.
      Backspace: () => {
        const { $from, empty } = this.editor.state.selection;

        if (!empty || !$from.parent.isTextblock) {
          return false;
        }

        if (!$from.nodeBefore?.isText || $from.nodeBefore?.text?.length !== 1) {
          return false;
        }

        if ($from.nodeAfter?.type !== this.type) {
          return false;
        }

        return this.editor.commands.deleteRange({
          from: $from.pos - 1,
          to: $from.pos,
        });
      },
    };
  },
});
