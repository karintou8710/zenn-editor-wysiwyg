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
          command: () => editor.chain().addRowBefore().focus().run(),
        },
        {
          value: 'add_row_after',
          label: '行を下に追加',
          command: () => editor.chain().addRowAfter().focus().run(),
        },
        {
          value: 'delete_row',
          label: '行を削除',
          command: () => editor.chain().deleteRow().focus().run(),
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

function getDecorations(doc: Node, editor: Editor) {
  const decorations: Decoration[] = [];
  const { $from } = editor.state.selection;

  if (
    $from.node(-1).type.name === 'tableCell' ||
    $from.node(-1).type.name === 'tableHeader'
  ) {
    const containerEl = createContainerElement();
    const firstCellEndInRow = calculateFirstCellEndInRow($from);

    let component: ReactRenderer | null = null;
    decorations.push(
      Decoration.widget(
        firstCellEndInRow,
        () => {
          component = createTableEditRenderer(editor);
          containerEl.appendChild(component.element);
          return containerEl;
        },
        {
          destroy: () => {
            if (component) {
              component.destroy();
              component = null;
            }
          },
        }
      )
    );
  }

  return DecorationSet.create(doc, decorations);
}

export function createTableEditDecorationPlugin(editor: Editor) {
  return new Plugin({
    key: new PluginKey('tableEditDecorationPlugin'),
    props: {
      decorations(state) {
        return getDecorations(state.doc, editor);
      },
    },
  });
}
