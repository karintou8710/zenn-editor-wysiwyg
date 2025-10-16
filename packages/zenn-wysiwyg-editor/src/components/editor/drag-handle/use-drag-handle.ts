import type { Node, Slice } from '@tiptap/pm/model';
import { NodeSelection } from '@tiptap/pm/state';
import type { Editor } from '@tiptap/react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

// ProseMirrorの内部実装がエクスポートされてないので、自前定義
class Dragging {
  constructor(
    // @ts-expect-error
    public slice: Slice,
    // @ts-expect-error
    public move: boolean,
    // @ts-expect-error
    public node?: NodeSelection
  ) {}
}

export interface DragTarget {
  dom: HTMLElement;
  node: Node;
  nodeSelection: NodeSelection;
}

export function useDragHandle(editor: Editor | null) {
  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null);

  const setTopBlockDragTarget = useCallback(
    (pos: number, forbidNodes: string[]) => {
      if (!editor) return;

      const $pos = editor.state.doc.resolve(pos);
      const beforePos = $pos.before(1);
      const dom = editor.view.nodeDOM(beforePos) as HTMLElement | null;
      const node = editor.state.doc.nodeAt(beforePos);

      if (!node || !dom) return;
      if (forbidNodes.includes(node.type.name)) return;

      setDragTarget({
        dom,
        node,
        nodeSelection: NodeSelection.create(editor.state.doc, beforePos),
      });
    },
    [editor]
  );

  const handleDragStart = useCallback(
    (ev: React.DragEvent) => {
      // ProseMirrorのDragStart参考に実装すれば良さそう。view.draggingに対象のNodeSelectionを入れる
      // https://github.com/ProseMirror/prosemirror-view/blob/b2e782ae7c8013505ba05683b185886585ef5939/src/input.ts

      if (!editor || dragTarget === null || !ev.dataTransfer) return;

      ev.dataTransfer.setDragImage(dragTarget.dom, 0, 0);
      ev.dataTransfer.effectAllowed = 'copyMove';

      editor.view.dragging = new Dragging(
        dragTarget.nodeSelection.content(),
        true,
        dragTarget.nodeSelection
      );
    },
    [editor, dragTarget]
  );

  const handleMouseMove = useCallback(
    (ev: MouseEvent) => {
      if (!editor) return;

      const posWithInside = editor.view.posAtCoords({
        left: ev.clientX,
        top: ev.clientY,
      });
      if (!posWithInside) return;

      // カーソルが乗った位置で、深さ１ノードのbefore位置を取得
      setTopBlockDragTarget(
        posWithInside.inside !== -1 ? posWithInside.inside : posWithInside.pos,
        ['footnotes']
      );
    },
    [editor, setTopBlockDragTarget]
  );

  const handleClick = useCallback(() => {
    if (!editor || dragTarget === null) return;

    editor
      ?.chain()
      .focus()
      .setNodeSelection(dragTarget.nodeSelection.from)
      .run();
  }, [editor, dragTarget]);

  const handleDragEnd = useCallback(() => {
    if (!editor) return;

    editor.view.dragging = null;
    setDragTarget(null);

    // Firefoxではドラッグ終了後にキャレットが表示されなくなるバグがある。
    // 別の要素にフォーカスを当てると回避できるため、ダミーボタンを作ってフォーカスを当てる。
    const button = document.createElement('button');
    button.style.position = 'absolute';
    button.style.left = '-9999px';
    document.body.appendChild(button);
    button.focus({
      preventScroll: true,
    });
    document.body.removeChild(button);
    editor.chain().focus().run();
  }, [editor]);

  const handleKeyDown = useCallback(() => {
    setDragTarget(null);
  }, []);

  useEffect(() => {
    if (!editor) return;

    const element = editor.$doc.element;
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, handleMouseMove, handleKeyDown]);

  useEffect(() => {
    const handleResize = () => {
      setDragTarget(null);
    };
    const handleMouseMoveOutside = (ev: MouseEvent) => {
      if (!editor) return;

      const editorDom = editor.view.dom as HTMLElement;
      const rect = editorDom.getBoundingClientRect();
      // DragHandle のアイコンがマウスに被っても消えないように、左側に50pxの余裕を持たせる
      const allowedLeft = rect.left - 50;
      const isInsideHorizontal =
        ev.clientX >= allowedLeft && ev.clientX <= rect.right;
      const isInsideVertical =
        ev.clientY >= rect.top && ev.clientY <= rect.bottom;

      if (isInsideHorizontal && isInsideVertical) return;

      setDragTarget(null);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMoveOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMoveOutside);
    };
  }, [editor]);

  return {
    dragTarget,
    handleDragStart,
    handleClick,
    handleDragEnd,
  };
}
