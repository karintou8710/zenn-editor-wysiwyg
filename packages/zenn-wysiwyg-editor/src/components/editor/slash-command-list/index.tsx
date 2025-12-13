import type { SuggestionProps } from '@tiptap/suggestion';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { cn } from '../../../lib/utils';
import styles from './index.module.css';
import type { SuggestionItem } from 'src/extensions/functionality/slash-command/items';
import { useSelectedIndex } from './useSelectedIndex';

export default forwardRef<any, SuggestionProps>((props, ref) => {
  const items = props.items as SuggestionItem[];
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [selectedIndex, setSelectedIndex] = useSelectedIndex(props.editor);
  const selectItem = (index: number) => {
    const item = items[index];

    if (item) {
      props.command({ key: item.value });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    const selectedElement = itemRefs.current[selectedIndex];
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className={styles.container} role="listbox">
      <ul>
        {items.length ? (
          items.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;
            return (
              <li
                key={index}
                id={`slash-command-item-${index}`}
                ref={(el) => (itemRefs.current[index] = el)}
                className={cn(styles.item, isSelected && styles.selected)}
                role="option"
                aria-selected={false} // スラッシュコマンドでは現在の擬似選択位置を持つが、内部的な要素の選択状態ではない
                onClick={() => selectItem(index)}
              >
                <Icon size={16} className={styles.icon} aria-hidden="true" />
                <span>{item.label}</span>
              </li>
            );
          })
        ) : (
          <li className={styles.noResult} role="status">
            No result
          </li>
        )}
      </ul>
    </div>
  );
});
