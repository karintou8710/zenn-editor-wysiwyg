import type { Express } from 'express';
import { createServer } from 'http';
import type { Server as HttpServer } from 'http';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import open from 'open';
import { getWorkingPath, resolveHostname } from './helper';
import fs from 'fs';
import path from 'path';
import { getLocalArticle, stringifyArticleWithMetaData } from './articles';
import {
  getLocalBookMeta,
  getLocalChapter,
  stringifyChapterWithMetaData,
} from './books';
import {
  WS_ArticleSavedMessage,
  WS_ChapterSavedMessage,
  WS_ClientMessage,
  WS_LocalArticleChangedMessage,
  WS_LocalChapterChangedMessage,
} from 'common/types';
import { glob } from 'glob';

type ServerOptions = {
  app: Express;
  port: number;
  shouldOpen: boolean;
  hostname?: string;
};

export async function startServer(options: ServerOptions): Promise<HttpServer> {
  const { app, port, hostname, shouldOpen } = options;
  const server = createServer(app);

  return new Promise((resolve, reject) => {
    server
      .listen(port, hostname)
      .once('listening', function () {
        if (process.env.TS_NODE_DEV) {
          console.log('🚀 Server is ready.');
        } else {
          const { name, host } = resolveHostname(hostname);

          console.log(`👀 Preview: http://${name}:${port}`);
          if (host) console.log(`🌏 NetWork: http://${host}:${port}`);
        }
        if (shouldOpen) open(`http://localhost:${port}`);
        resolve(server);
      })
      .once('error', async function (err) {
        if (err.message.includes('EADDRINUSE')) {
          console.log(
            `💡 ポート${port}は既に使用されています。別のポートで起動中…`
          );
          const server = await startServer({ ...options, port: port + 1 });
          resolve(server);
        } else {
          reject(err);
        }
      });
  });
}

export async function startLocalChangesWatcher(
  server: HttpServer,
  watchPathGlob: string
) {
  const wss = new WebSocketServer({ server });
  const watchPaths = await glob(watchPathGlob);
  const watcher = chokidar.watch(watchPaths);

  const broadcast = (
    payload: WS_LocalArticleChangedMessage | WS_LocalChapterChangedMessage
  ) => {
    wss.clients.forEach((client) => client.send(JSON.stringify(payload)));
  };

  const writeWithWatcherPaused = (outputFile: string, content: string) => {
    watcher.unwatch(watchPaths);
    fs.writeFileSync(outputFile, content, 'utf-8');
    watcher.add(watchPaths);
  };

  watcher.on('change', (changedPath) => {
    if (changedPath.includes('/articles/')) {
      const slug = changedPath.split('/articles/')[1].replace(/\.mdx?$/, '');
      const article = getLocalArticle(slug);
      if (!article) {
        console.error(`記事の取得に失敗しました: ${slug}`);
        return;
      }

      const req: WS_LocalArticleChangedMessage = {
        type: 'localArticleFileChanged',
        data: { article },
      };

      broadcast(req);
    }

    if (changedPath.includes('/books/')) {
      const afterBooks = changedPath.split('/books/')[1] ?? '';
      const [bookSlug, chapterFilename] = afterBooks.split('/');
      if (!bookSlug || !chapterFilename?.endsWith('.md')) return;

      const book = getLocalBookMeta(bookSlug);
      if (!book) {
        console.error(`本の取得に失敗しました: ${bookSlug}`);
        return;
      }

      const chapter = getLocalChapter(book, chapterFilename);
      if (!chapter) {
        console.error(`チャプターの取得に失敗しました: ${chapterFilename}`);
        return;
      }

      const req: WS_LocalChapterChangedMessage = {
        type: 'localChapterFileChanged',
        data: { bookSlug, chapter },
      };

      broadcast(req);
    }
  });

  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      const msg = message.toString();

      const res: WS_ClientMessage = JSON.parse(msg);
      if (res.type === 'contentChanged') {
        const article = res.data.article;

        const outputDir = `${getWorkingPath('')}/articles`;
        const outputFile = path.join(outputDir, `${res.data.article.slug}.md`);

        const contentWithMeta = stringifyArticleWithMetaData(article);

        writeWithWatcherPaused(outputFile, contentWithMeta);

        const updatedArticle = getLocalArticle(article.slug);
        if (!updatedArticle) {
          console.error(`記事の取得に失敗しました: ${article.slug}`);
          return;
        }

        const req: WS_ArticleSavedMessage = {
          type: 'articleSaved',
          data: { article: updatedArticle },
        };

        ws.send(JSON.stringify(req));
      }

      if (res.type === 'chapterContentChanged') {
        const { bookSlug, chapter } = res.data;

        const outputDir = `${getWorkingPath('')}/books/${bookSlug}`;
        const outputFile = path.join(outputDir, chapter.filename);

        const contentWithMeta = stringifyChapterWithMetaData(chapter);

        writeWithWatcherPaused(outputFile, contentWithMeta);

        const book = getLocalBookMeta(bookSlug);
        if (!book) {
          console.error(`本の取得に失敗しました: ${bookSlug}`);
          return;
        }

        const updatedChapter = getLocalChapter(book, chapter.filename);
        if (!updatedChapter) {
          console.error(`チャプターの取得に失敗しました: ${chapter.filename}`);
          return;
        }

        const req: WS_ChapterSavedMessage = {
          type: 'chapterSaved',
          data: { bookSlug, chapter: updatedChapter },
        };

        ws.send(JSON.stringify(req));
      }
    });
  });

  process.on('SIGINT', () => {
    // close by `Ctrl-C`
    wss.close();
    watcher.close();
    process.exit();
  });
}
