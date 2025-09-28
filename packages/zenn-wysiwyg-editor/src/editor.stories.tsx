import type { Meta, StoryObj } from '@storybook/react-vite';
import { useZennEditor } from '.';
import EditorContent from './components/editor/editor-content';

type EditorProps = {
  initialContent?: string;
};

function Editor({ initialContent }: EditorProps) {
  const editor = useZennEditor({
    initialContent: initialContent || '',
  });
  return <EditorContent editor={editor} />;
}

const meta = {
  component: Editor,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '760px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Heading: Story = {
  args: {
    initialContent:
      '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><h4>Heading 4</h4>',
  },
};

export const Blockquote: Story = {
  args: {
    initialContent:
      '<blockquote><p>Blockquote content</p><p>Blockquote content</p></blockquote>',
  },
};

export const CodeBlock: Story = {
  args: {
    initialContent: `
    <div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div>
    <pre><code class="language-javascript">console.log("hello");</code></pre></div>
    <div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename">example.ts</span></div>
    <pre><code class="language-diff-python diff-highlight"><span>+ import os</span></code></pre></div>
    `,
  },
};

export const Table: Story = {
  args: {
    initialContent: `
    <table>
      <thead>
        <tr>
          <th>項目</th>
          <th>値</th>
          <th>備考</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>項目1</td>
          <td>値1</td>
          <td>備考1</td>
        </tr>
        <tr>
          <td>項目2</td>
          <td>値2</td>
          <td>備考2</td>
        </tr>
        <tr>
          <td>項目3</td>
          <td>値3</td>
          <td>備考3</td>
        </tr>
      </tbody>
    </table>
    `,
  },
};
