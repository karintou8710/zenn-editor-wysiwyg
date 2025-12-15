import type { SuggestionOptions } from '@tiptap/suggestion';
import type { LucideIcon } from 'lucide-react';
import {
  MessageSquare,
  AlertTriangle,
  ChevronDown,
  Table,
  Code,
  GitCompare,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Minus,
} from 'lucide-react';

export type SuggestionItem = {
  value: string;
  label: string;
  icon: LucideIcon;
  command: SuggestionOptions['command'];
};

export const items: SuggestionItem[] = [
  {
    value: 'message',
    label: 'メッセージ',
    icon: MessageSquare,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMessage({
          type: 'message',
        })
        .run();
    },
  },
  {
    value: 'alert',
    label: 'メッセージ（アラート）',
    icon: AlertTriangle,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMessage({
          type: 'alert',
        })
        .run();
    },
  },
  {
    value: 'details',
    label: 'アコーディオン',
    icon: ChevronDown,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setDetails().run();
    },
  },
  {
    value: 'table',
    label: 'テーブル',
    icon: Table,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  {
    value: 'codeBlock',
    label: 'コードブロック',
    icon: Code,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCodeBlockContainer({
          language: 'plaintext',
          isDiff: false,
        })
        .run();
    },
  },
  {
    value: 'diffCodeBlock',
    label: '差分コードブロック',
    icon: GitCompare,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCodeBlockContainer({
          language: 'plaintext',
          isDiff: true,
        })
        .run();
    },
  },
  {
    value: 'heading1',
    label: '見出し1',
    icon: Heading1,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    value: 'heading2',
    label: '見出し2',
    icon: Heading2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    value: 'heading3',
    label: '見出し3',
    icon: Heading3,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    value: 'heading4',
    label: '見出し4',
    icon: Heading4,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 4 }).run();
    },
  },
  {
    value: 'bulletList',
    label: '箇条書きリスト',
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    value: 'orderedList',
    label: '番号付きリスト',
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    value: 'blockquote',
    label: '引用',
    icon: Quote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    value: 'horizontalRule',
    label: '区切り線',
    icon: Minus,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];
