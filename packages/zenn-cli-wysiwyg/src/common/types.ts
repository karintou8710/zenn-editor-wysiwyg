import { Article, Chapter } from 'zenn-model';
import { itemSortTypes } from './helper';

export type ItemSortType = (typeof itemSortTypes)[number];

export type WS_ClientMessage = WS_ArticlePostMessage | WS_ChapterPostMessage;
export type WS_ServerMessage =
  | WS_LocalArticleChangedMessage
  | WS_ArticleSavedMessage
  | WS_LocalChapterChangedMessage
  | WS_ChapterSavedMessage;

export type WS_ServerMessageType = WS_ServerMessage['type'];

type ArticlePayload = { article: Article };
type ChapterPayload = { bookSlug: string; chapter: Chapter };

export type WS_LocalArticleChangedMessage = {
  type: 'localArticleFileChanged';
  data: ArticlePayload;
};

export type WS_ArticleSavedMessage = {
  type: 'articleSaved';
  data: ArticlePayload;
};

export type WS_ArticlePostMessage = {
  type: 'contentChanged';
  data: ArticlePayload;
};

export type WS_LocalChapterChangedMessage = {
  type: 'localChapterFileChanged';
  data: ChapterPayload;
};

export type WS_ChapterSavedMessage = {
  type: 'chapterSaved';
  data: ChapterPayload;
};

export type WS_ChapterPostMessage = {
  type: 'chapterContentChanged';
  data: ChapterPayload;
};
