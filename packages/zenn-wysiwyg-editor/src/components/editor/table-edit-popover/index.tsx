import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';

import styles from './index.module.css';

export type TableMenuItem = {
  value: string;
  label: string;
  command: () => void;
};

type Props = {
  items: TableMenuItem[];
};

export default function TableEditPopover({ items }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={styles.trigger}>
          <svg viewBox="0 0 4 16" fill="currentColor">
            <circle cx="2" cy="6" r="0.5" />
            <circle cx="2" cy="8" r="0.5" />
            <circle cx="2" cy="10" r="0.5" />
          </svg>
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
