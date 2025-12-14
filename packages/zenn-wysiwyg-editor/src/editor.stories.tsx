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
  decorators: [
    (Story) => (
      <div style={{ width: '760px', margin: '5rem auto' }}>
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

export const UnorderedList: Story = {
  args: {
    initialContent: `
    <ul>
      <li><p>リスト項目1</p></li>
      <li><p>リスト項目2</p></li>
      <li><p>リスト項目3</p></li>
    </ul>
    <p>ネストされたリスト:</p>
    <ul>
      <li><p>親項目1</p>
        <ul>
          <li><p>子項目1-1</p></li>
          <li><p>子項目1-2</p></li>
        </ul>
      </li>
      <li><p>親項目2</p>
        <ul>
          <li><p>子項目2-1</p></li>
          <li><p>子項目2-2</p></li>
        </ul>
      </li>
    </ul>
    `,
  },
};

export const OrderedList: Story = {
  args: {
    initialContent: `
    <ol>
      <li><p>最初の項目</p></li>
      <li><p>2番目の項目</p></li>
      <li><p>3番目の項目</p></li>
    </ol>
    <p>ネストされた順序付きリスト:</p>
    <ol>
      <li><p>親項目1</p>
        <ol>
          <li><p>子項目1-1</p></li>
          <li><p>子項目1-2</p></li>
        </ol>
      </li>
      <li><p>親項目2</p>
        <ol>
          <li><p>子項目2-1</p></li>
          <li><p>子項目2-2</p></li>
        </ol>
      </li>
    </ol>
    `,
  },
};

export const HorizontalRule: Story = {
  args: {
    initialContent: `
    <p>区切り線の前のテキスト</p>
    <hr>
    <p>区切り線の後のテキスト</p>
    <hr>
    <p>複数の区切り線を使って、コンテンツをセクションに分けることができます。</p>
    <hr>
    <p>最後のセクション</p>
    `,
  },
};

export const Image: Story = {
  args: {
    initialContent: `
    <p>基本的な画像:</p>
    <p><img src="https://placehold.co/600x400" alt="画像の説明"></p>
    <p>キャプション付き画像:</p>
    <p><img src="https://placehold.co/600x400" alt="画像の説明"><em>これは画像のキャプションです</em></p>
    <p>横幅設定された画像(300px):</p>
    <p><img src="https://placehold.co/600x400" alt="小さい画像" width="300"></p>
    <p>リンク付き画像:</p>
    <p><a href="https://zenn.dev" target="_blank" rel="nofollow noopener"><img src="https://placehold.co/600x400" alt="リンク画像"></a></p>
    `,
  },
};

export const Link: Story = {
  args: {
    initialContent: `
    <p>通常のテキストリンク: <a href="https://zenn.dev" target="_blank" rel="nofollow noopener">Zennのホームページ</a></p>
    <p>文章の中にリンクを含める例: この<a href="https://github.com" target="_blank" rel="nofollow noopener">GitHub</a>は開発者向けのプラットフォームです。</p>
    <p>複数のリンク: <a href="https://zenn.dev" target="_blank" rel="nofollow noopener">Zenn</a>と<a href="https://github.com" target="_blank" rel="nofollow noopener">GitHub</a>と<a href="https://twitter.com" target="_blank" rel="nofollow noopener">Twitter</a></p>
    `,
  },
};

export const Footnote: Story = {
  args: {
    initialContent: `
    <p>脚注の例<sup class="footnote-ref"><a href="#fn-1" id="fnref-1">[1]</a></sup>です。</p>
    <p>複数の脚注を使うこともできます<sup class="footnote-ref"><a href="#fn-2" id="fnref-2">[2]</a></sup>。</p>
    <p>同じ段落に複数の脚注<sup class="footnote-ref"><a href="#fn-3" id="fnref-3">[3]</a></sup>を配置することも可能です<sup class="footnote-ref"><a href="#fn-4" id="fnref-4">[4]</a></sup>。</p>
    <section class="footnotes">
      <ol>
        <li id="fn-1" class="footnote-item" data-footnote-reference-id="fnref-1"><p>これは最初の脚注の内容です。</p></li>
        <li id="fn-2" class="footnote-item" data-footnote-reference-id="fnref-2"><p>2番目の脚注では詳細な説明を追加できます。</p></li>
        <li id="fn-3" class="footnote-item" data-footnote-reference-id="fnref-3"><p>3番目の脚注です。</p></li>
        <li id="fn-4" class="footnote-item" data-footnote-reference-id="fnref-4"><p>4番目の脚注で、より多くの情報を提供します。</p></li>
      </ol>
    </section>
    `,
  },
};

export const TextFormatting: Story = {
  args: {
    initialContent: `
    <p><em>イタリック体のテキスト</em>です。</p>
    <p><strong>太字のテキスト</strong>です。</p>
    <p><s>打ち消し線のテキスト</s>です。</p>
    <p><code>インラインコード</code>です。</p>
    <p>これらは<strong>組み合わせて<em>使用</em>することも</strong>できます。</p>
    <p><strong><em>太字とイタリックを同時に</em></strong>適用できます。</p>
    <p>文章の中で<code>const value = 123;</code>のようにコードを挿入したり、<strong>重要な部分を強調</strong>したり、<s>間違った情報を訂正</s>したりできます。</p>
    `,
  },
};

export const Message: Story = {
  args: {
    initialContent: `
    <p>通常のメッセージ:</p>
    <aside class="msg"><div class="msg-content"><p>これは通常のメッセージボックスです。</p></div></aside>
    <p>アラートメッセージ:</p>
    <aside class="msg alert"><div class="msg-content"><p>これは警告メッセージです。重要な情報を伝える時に使用します。</p></div></aside>
    <p>複数段落のメッセージ:</p>
    <aside class="msg"><div class="msg-content"><p>最初の段落です。</p><p>2番目の段落です。</p><p>3番目の段落です。</p></div></aside>
    `,
  },
};

export const Details: Story = {
  args: {
    initialContent: `
    <p>基本的なアコーディオン:</p>
    <details><summary>詳細を表示</summary><div class="details-content"><p>ここに詳細な内容が入ります。</p></div></details>
    <p>複数段落のアコーディオン:</p>
    <details><summary>複数の段落</summary><div class="details-content"><p>最初の段落です。</p><p>2番目の段落です。</p><p>3番目の段落です。</p></div></details>
    <p>ネストされたアコーディオン:</p>
    <details><summary>外側のアコーディオン</summary><div class="details-content"><p>外側の内容</p><details><summary>内側のアコーディオン</summary><div class="details-content"><p>内側の内容</p></div></details></div></details>
    `,
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
