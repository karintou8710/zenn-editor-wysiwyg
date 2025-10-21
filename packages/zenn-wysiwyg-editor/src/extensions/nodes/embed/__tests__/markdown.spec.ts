import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { describe, expect, it } from 'vitest';
import { EMBED_ORIGIN } from '../../../../lib/constants';
import { convertMarkdownToEditable } from '../../../../lib/from-markdown';
import { markdownSerializer } from '../../../../lib/to-markdown';
import { createTiptapEditor } from '../../../../tests/node/editor';
import { Embed } from '..';

const basicExtensions = [Document, Paragraph, Text, Embed];

const MERMAID_SAMPLE = 'graph TD;\nA-->B;';
const YOUTUBE_VIDEO_ID = 'dQw4w9WgXcQ';

function createServerEmbedHtml(
  type: 'card' | 'tweet' | 'github' | 'gist' | 'mermaid',
  original: string
) {
  const encoded = encodeURIComponent(original);
  return `<span class="embed-block zenn-embedded zenn-embedded-${type}"><iframe src="${EMBED_ORIGIN}/${type}#dummy" data-content="${encoded}"></iframe></span>`;
}

function createEmbedHtml(type: string, src: string) {
  return `<span class="embed-block embed-${type}"><iframe src="${src}"></iframe></span>`;
}

function findFirstEmbedNode(doc: ProseMirrorNode): ProseMirrorNode | null {
  let found: ProseMirrorNode | null = null;
  doc.descendants((node) => {
    if (found) return false;
    if (node.type.name === 'embed') {
      found = node;
      return false;
    }
    return undefined;
  });
  return found;
}

describe('出力', () => {
  const cases = [
    {
      type: 'card',
      html: createServerEmbedHtml(
        'card',
        'https://example.com/articles/embed-card'
      ),
      expected: 'https://example.com/articles/embed-card',
    },
    {
      type: 'tweet',
      html: createServerEmbedHtml(
        'tweet',
        'https://twitter.com/zenn/status/1234567890123456789'
      ),
      expected: 'https://twitter.com/zenn/status/1234567890123456789',
    },
    {
      type: 'github',
      html: createServerEmbedHtml(
        'github',
        'https://github.com/zenn-dev/zenn-editor/blob/main/README.md'
      ),
      expected: 'https://github.com/zenn-dev/zenn-editor/blob/main/README.md',
    },
    {
      type: 'gist',
      html: createServerEmbedHtml(
        'gist',
        'https://gist.github.com/zenn/0123456789abcdef0123456789abcdef'
      ),
      expected:
        '@[gist](https://gist.github.com/zenn/0123456789abcdef0123456789abcdef)',
    },
    {
      type: 'mermaid',
      html: createServerEmbedHtml('mermaid', MERMAID_SAMPLE),
      expected: `\`\`\`mermaid\n${MERMAID_SAMPLE}\n\`\`\``,
    },
    {
      type: 'codepen',
      html: createEmbedHtml(
        'codepen',
        'https://codepen.io/zenn/embed/pen-123?embed-version=2'
      ),
      expected:
        '@[codepen](https://codepen.io/zenn/pen/pen-123?embed-version=2)',
    },
    {
      type: 'codesandbox',
      html: createEmbedHtml(
        'codesandbox',
        'https://codesandbox.io/embed/x2cj6p'
      ),
      expected: '@[codesandbox](https://codesandbox.io/embed/x2cj6p)',
    },
    {
      type: 'stackblitz',
      html: createEmbedHtml(
        'stackblitz',
        'https://stackblitz.com/edit/angular-examples'
      ),
      expected: '@[stackblitz](https://stackblitz.com/edit/angular-examples)',
    },
    {
      type: 'jsfiddle',
      html: createEmbedHtml(
        'jsfiddle',
        'https://jsfiddle.net/zenn/abc123/embedded/'
      ),
      expected: '@[jsfiddle](https://jsfiddle.net/zenn/abc123/embedded/)',
    },
    {
      type: 'figma',
      html: createEmbedHtml(
        'figma',
        'https://www.figma.com/embed?embed_host=zenn&url=https://www.figma.com/file/abcdefghijabcdefghij1234/example'
      ),
      expected:
        '@[figma](https://www.figma.com/file/abcdefghijabcdefghij1234/example)',
    },
    {
      type: 'docswell',
      html: createEmbedHtml(
        'docswell',
        'https://www.docswell.com/slide/LK7J5V/embed'
      ),
      expected: '@[docswell](https://www.docswell.com/slide/LK7J5V/embed)',
    },
    {
      type: 'youtube',
      html: createEmbedHtml(
        'youtube',
        `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}`
      ),
      expected: `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`,
    },
    {
      type: 'slideshare',
      html: createEmbedHtml(
        'slideshare',
        'https://www.slideshare.net/slideshow/embed_code/key/abcd123'
      ),
      expected: '@[slideshare](abcd123)',
    },
    {
      type: 'blueprintue',
      html: createEmbedHtml(
        'blueprintue',
        'https://blueprintue.com/render/sample-id/'
      ),
      expected: '@[blueprintue](https://blueprintue.com/render/sample-id/)',
    },
  ] as const;

  it.each(cases)('$type をマークダウンに変換できる', ({ html, expected }) => {
    const editor = createTiptapEditor({
      extensions: basicExtensions,
      content: html,
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);
    expect(markdown).toBe(expected);
  });
});

describe('入力', () => {
  const cases = [
    {
      type: 'card',
      markdown: '@[card](https://example.com/articles/embed-card)',
      expectedUrl: 'https://example.com/articles/embed-card',
    },
    {
      type: 'tweet',
      markdown: '@[tweet](https://twitter.com/zenn/status/1234567890123456789)',
      expectedUrl: 'https://twitter.com/zenn/status/1234567890123456789',
    },
    {
      type: 'github',
      markdown:
        '@[github](https://github.com/zenn-dev/zenn-editor/blob/main/README.md)',
      expectedUrl:
        'https://github.com/zenn-dev/zenn-editor/blob/main/README.md',
    },
    {
      type: 'gist',
      markdown:
        '@[gist](https://gist.github.com/zenn/0123456789abcdef0123456789abcdef)',
      expectedUrl:
        'https://gist.github.com/zenn/0123456789abcdef0123456789abcdef',
    },
    {
      type: 'mermaid',
      markdown: `\`\`\`mermaid\n${MERMAID_SAMPLE}\n\`\`\``,
      expectedUrl: MERMAID_SAMPLE,
    },
    {
      type: 'codepen',
      markdown: '@[codepen](https://codepen.io/zenn/pen/pen-123)',
      expectedUrl: 'https://codepen.io/zenn/embed/pen-123?embed-version=2',
    },
    {
      type: 'codesandbox',
      markdown: '@[codesandbox](https://codesandbox.io/embed/x2cj6p)',
      expectedUrl: 'https://codesandbox.io/embed/x2cj6p',
    },
    {
      type: 'stackblitz',
      markdown: '@[stackblitz](https://stackblitz.com/edit/angular-examples)',
      expectedUrl: 'https://stackblitz.com/edit/angular-examples',
    },
    {
      type: 'jsfiddle',
      markdown: '@[jsfiddle](https://jsfiddle.net/zenn/abc123/embedded/)',
      expectedUrl: 'https://jsfiddle.net/zenn/abc123/embedded/',
    },
    {
      type: 'figma',
      markdown:
        '@[figma](https://www.figma.com/file/abcdefghijabcdefghij1234/example)',
      expectedUrl:
        'https://www.figma.com/embed?embed_host=zenn&url=https://www.figma.com/file/abcdefghijabcdefghij1234/example',
    },
    {
      type: 'docswell',
      markdown: '@[docswell](https://www.docswell.com/slide/LK7J5V/embed)',
      expectedUrl: 'https://www.docswell.com/slide/LK7J5V/embed',
    },
    {
      type: 'slideshare',
      markdown: '@[slideshare](abcd123)',
      expectedUrl:
        'https://www.slideshare.net/slideshow/embed_code/key/abcd123',
    },
    {
      type: 'youtube',
      markdown: `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`,
      expectedUrl: `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}`,
    },
    {
      type: 'blueprintue',
      markdown: '@[blueprintue](https://blueprintue.com/render/sample-id/)',
      expectedUrl: 'https://blueprintue.com/render/sample-id/',
    },
  ] as const;

  it.each(cases)(
    '$type の記法を埋め込みノードに変換できる',
    ({ markdown, type, expectedUrl }) => {
      const html = convertMarkdownToEditable(markdown);
      const editor = createTiptapEditor({
        extensions: basicExtensions,
        content: html,
      });

      const embedNode = findFirstEmbedNode(editor.state.doc);
      if (!embedNode) {
        throw new Error(
          `embed node not found for ${type}. doc: ${editor.state.doc.toString()}`
        );
      }

      expect(embedNode.attrs.type).toBe(type);
      expect(embedNode.attrs.url).toBe(expectedUrl);
    }
  );
});
