import { TableCell as TiptapTableCell } from '@tiptap/extension-table';

export const TableCell = TiptapTableCell.extend({
  /*
   * text* だとデコレーション配置周りで不具合があるため、編集用に paragraph に固定する。
   * この paragraph はマークダウン出力をしない。
   */
  content: 'paragraph',
});
