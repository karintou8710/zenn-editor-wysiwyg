import type { Node, ResolvedPos } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Editor, ReactRenderer } from '@tiptap/react';
import TableEditPopover from '../../../components/editor/table-edit-popover';

function createContainerElement(): HTMLDivElement {
  const containerEl = document.createElement('div');
  containerEl.style.position = 'absolute';
  containerEl.style.top = '0';
  containerEl.style.right = 'auto';
  containerEl.style.bottom = '0';
  containerEl.style.left = '-10px';
  containerEl.style.height = '20px';
  containerEl.style.margin = 'auto 0';
  return containerEl;
}

function createTableEditRenderer(editor: Editor): ReactRenderer {
  return new ReactRenderer(TableEditPopover, {
    editor: editor,
    props: {
      items: [
        {
          value: 'add_row_before',
          label: '行を上に追加',
          command: () =>
            editor
              .chain()
              .toggleHeaderRow() // 全体をtdにする -> 行追加 -> 先頭の行をヘッダーに戻す
              .addRowBefore()
              .toggleHeaderRow()
              .focus()
              .run(),
        },
        {
          value: 'add_row_after',
          label: '行を下に追加',
          command: () =>
            editor
              .chain()
              .toggleHeaderRow() // 全体をtdにする -> 行追加 -> 先頭の行をヘッダーに戻す
              .addRowAfter()
              .toggleHeaderRow()
              .focus()
              .run(),
        },
        {
          value: 'delete_row',
          label: '行を削除',
          command: () => {
            const { $from } = editor.state.selection; // セルの中の段落を選択中
            const table = $from.node(-3);
            if (table.childCount <= 1) {
              // 行が1行しかない場合はテーブルごと削除
              return editor.chain().deleteTable().focus().run();
            }

            if ($from.index(-3) === 0) {
              // 先頭行を削除する場合は、先頭の行をヘッダーに戻す
              return editor.chain().deleteRow().toggleHeaderRow().focus().run();
            }

            return editor.chain().deleteRow().focus().run();
          },
        },
      ],
    },
  });
}

function calculateFirstCellEndInRow($from: ResolvedPos): number {
  const firstCell = $from.node(-2).firstChild;
  if (!firstCell) throw new Error('No first cell found in the table row');
  return $from.before(-2) + firstCell.nodeSize;
}

function getDecorations(doc: Node, editor: Editor, element: HTMLElement) {
  const decorations: Decoration[] = [];
  const { $from } = editor.state.selection;

  if ($from.depth < 2) return DecorationSet.empty;
  if (
    $from.node(-1).type.name !== 'tableCell' &&
    $from.node(-1).type.name !== 'tableHeader'
  ) {
    return DecorationSet.empty;
  }

  decorations.push(
    Decoration.widget(calculateFirstCellEndInRow($from), () => {
      return element;
    })
  );

  return DecorationSet.create(doc, decorations);
}

export function createTableEditDecorationPlugin(editor: Editor) {
  const renderer = createTableEditRenderer(editor);

  return new Plugin({
    key: new PluginKey('tableEditDecorationPlugin'),
    props: {
      decorations(state) {
        const containerEl = createContainerElement();
        containerEl.appendChild(renderer.element);
        return getDecorations(state.doc, editor, containerEl);
      },
    },
    view: () => ({
      destroy: () => {
        renderer.destroy();
      },
    }),
  });
}
