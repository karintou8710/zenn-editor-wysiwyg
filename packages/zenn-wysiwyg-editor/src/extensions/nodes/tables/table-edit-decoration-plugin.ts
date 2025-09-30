import type { Node, ResolvedPos } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Editor, ReactRenderer } from '@tiptap/react';
import TableEditPopover from '../../../components/editor/table-edit-popover';

function createContainerElement(type: 'row' | 'col'): HTMLDivElement {
  const containerEl = document.createElement('div');
  containerEl.style.position = 'absolute';
  if (type === 'row') {
    containerEl.style.top = '0';
    containerEl.style.bottom = '0';
    containerEl.style.left = '-10px';
    containerEl.style.height = '20px';
    containerEl.style.margin = 'auto 0';
  } else {
    containerEl.style.top = '-10px';
    containerEl.style.right = '0';
    containerEl.style.left = '0';
    containerEl.style.width = '20px';
    containerEl.style.margin = '0 auto';
  }
  return containerEl;
}

function createTableRowEditRenderer(editor: Editor): ReactRenderer {
  return new ReactRenderer(TableEditPopover, {
    editor: editor,
    props: {
      type: 'row',
      items: [
        {
          value: 'add_row_before',
          label: '行を上に追加',
          command: () =>
            editor
              .chain()
              .unsetTableHeader()
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
              .unsetTableHeader()
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

function createTableColEditRenderer(editor: Editor): ReactRenderer {
  return new ReactRenderer(TableEditPopover, {
    editor: editor,
    props: {
      type: 'col',
      items: [
        {
          value: 'add_col_before',
          label: '列を左に追加',
          command: () =>
            editor
              .chain()
              .unsetTableHeader() // 全体をtdにする -> 列追加 -> 先頭の行をヘッダーに戻す
              .addColumnBefore()
              .toggleHeaderRow()
              .focus()
              .run(),
        },
        {
          value: 'add_col_after',
          label: '列を右に追加',
          command: () =>
            editor
              .chain()
              .unsetTableHeader() // 全体をtdにする -> 列追加 -> 先頭の行をヘッダーに戻す
              .addColumnAfter()
              .toggleHeaderRow()
              .focus()
              .run(),
        },
        {
          value: 'delete_col',
          label: '列を削除',
          command: () => {
            const { $from } = editor.state.selection; // セルの中の段落を選択中
            const row = $from.node(-2);
            if (row.childCount <= 1) {
              // 列が1列しかない場合はテーブルごと削除
              return editor.chain().deleteTable().focus().run();
            }

            return editor.chain().deleteColumn().focus().run();
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

function calculateFirstCellInCol($from: ResolvedPos): number {
  const table = $from.node(-3); // $from は td or th の中の p
  let pos = $from.start(-3) + 2; // テーブルの最初のセルの中
  const firstRow = table.firstChild;
  if (!firstRow) throw new Error('No first row found in the table');

  for (let i = 0; i < $from.index(-2); i++) {
    pos += firstRow.child(i).nodeSize;
  }
  return pos;
}

function getDecorations(
  doc: Node,
  editor: Editor,
  rowEl: HTMLElement,
  colEl: HTMLElement
) {
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
      return rowEl;
    })
  );
  decorations.push(
    Decoration.widget(calculateFirstCellInCol($from), () => {
      return colEl;
    })
  );

  return DecorationSet.create(doc, decorations);
}

export function createTableEditDecorationPlugin(editor: Editor) {
  const rowRenderer = createTableRowEditRenderer(editor);
  const colRenderer = createTableColEditRenderer(editor);

  return new Plugin({
    key: new PluginKey('tableEditDecorationPlugin'),
    props: {
      decorations(state) {
        const containerRowEl = createContainerElement('row');
        const containerColEl = createContainerElement('col');
        containerRowEl.appendChild(rowRenderer.element);
        containerColEl.appendChild(colRenderer.element);
        return getDecorations(
          state.doc,
          editor,
          containerRowEl,
          containerColEl
        );
      },
    },
    view: () => ({
      destroy: () => {
        rowRenderer.destroy();
        colRenderer.destroy();
      },
    }),
  });
}
