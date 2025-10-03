import { cn } from '../../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';

import styles from './index.module.css';

export type TableMenuItem = {
  value: string;
  label: string;
  command: () => void;
};

type Props = {
  type: 'col' | 'row';
  items: TableMenuItem[];
};

export default function TableEditPopover({ type, items }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            styles.trigger,
            type === 'row' ? styles.triggerRow : styles.triggerCol
          )}
          /* onClick 発火までに onMouseDown でイベントが止まるため、イベントをストップする（原因不明） */
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {type === 'row' ? (
            <svg viewBox="0 0 10 20" fill="currentColor">
              <circle cx="5" cy="5" r="1.3" />
              <circle cx="5" cy="10" r="1.3" />
              <circle cx="5" cy="15" r="1.3" />
            </svg>
          ) : (
            <svg width={20} height={10} viewBox="0 0 20 10" fill="currentColor">
              <circle cx="5" cy="5" r="1.3" />
              <circle cx="10" cy="5" r="1.3" />
              <circle cx="15" cy="5" r="1.3" />
            </svg>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className={styles.container} sideOffset={10}>
        {items.map((item) => (
          <button
            key={item.value}
            onClick={item.command}
            className={styles.item}
          >
            {item.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
