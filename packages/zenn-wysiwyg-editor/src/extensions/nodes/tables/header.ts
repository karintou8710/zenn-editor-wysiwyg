import { TableHeader as TiptapTableHeader } from '@tiptap/extension-table';
import { Editor, type ChainedCommands } from '@tiptap/react';
import { EditorState, Transaction } from '@tiptap/pm/state';
import { Node } from '@tiptap/pm/model';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableHeader: {
      unsetTableHeader: () => ReturnType;
    };
  }
}

export const TableHeader = TiptapTableHeader.extend({
  content: 'paragraph',

  addCommands() {
    return {
      unsetTableHeader:
        () =>
        ({
          chain,
          editor,
        }: {
          chain: () => ChainedCommands;
          editor: Editor;
        }) => {
          if (!editor.isActive('table')) {
            return false;
          }

          return chain()
            .command(
              ({ tr, state }: { tr: Transaction; state: EditorState }) => {
                const { selection } = state;
                const { $from } = selection;

                let tableNode: Node | null = null;
                let tablePos: number | null = null;

                for (let depth = $from.depth; depth >= 0; depth--) {
                  const node = $from.node(depth);
                  if (node.type.name === 'table') {
                    tableNode = node;
                    tablePos = $from.start(depth) - 1;
                    break;
                  }
                }

                if (!tableNode || tablePos === null) {
                  return false;
                }

                let changed = false;
                tableNode.descendants((node: Node, pos: number) => {
                  if (node.type.name === 'tableHeader') {
                    const absolutePos = tablePos + pos + 1;
                    const cellType = state.schema.nodes.tableCell;
                    tr.setNodeMarkup(
                      absolutePos,
                      cellType,
                      node.attrs,
                      node.marks
                    );
                    changed = true;
                  }
                });

                return changed;
              }
            )
            .run();
        },
    };
  },
});
