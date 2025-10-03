import type { Meta, StoryObj } from '@storybook/react-vite';
import { useZennEditor } from '.';
import EditorContent from './components/editor/editor-content';
import { useEffect } from 'react';
import 'zenn-content-css/lib/index.css';

type EditorProps = {
  initialContent?: string;
};

function Editor({ initialContent }: EditorProps) {
  useEffect(() => {
    import('zenn-embed-elements');
  }, []);

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

export const MathBlock: Story = {
  args: {
    initialContent: `
    <section>
      <eqn>
        <embed-katex display-mode="1">\\begin{align}
f(x) &= x^2 + 2x + 1 \\\\
&= (x + 1)^2
\\end{align}</embed-katex>
      </eqn>
    </section>
    <p>ブロック数式の例です。</p>
    <section>
      <eqn>
        <embed-katex display-mode="1">\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}</embed-katex>
      </eqn>
    </section>
    `,
  },
};

export const MathInline: Story = {
  args: {
    initialContent: `
    <p>インライン数式の例: <embed-katex>E = mc^2</embed-katex> はアインシュタインの有名な式です。</p>
    <p>他にも <embed-katex>\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}</embed-katex> という公式があります。</p>
    <p>微分の例: <embed-katex>\\frac{d}{dx}(x^2) = 2x</embed-katex></p>
    `,
  },
};
