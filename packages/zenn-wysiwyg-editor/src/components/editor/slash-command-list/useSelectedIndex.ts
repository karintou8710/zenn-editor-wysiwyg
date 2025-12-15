import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';

export const useSelectedIndex = (editor: Editor) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    editor.view.dom.setAttribute(
      'aria-activedescendant',
      `slash-command-item-${selectedIndex}`
    );

    return () => {
      editor.view.dom.removeAttribute('aria-activedescendant');
    };
  }, [editor, selectedIndex]);

  return [selectedIndex, setSelectedIndex] as const;
};
