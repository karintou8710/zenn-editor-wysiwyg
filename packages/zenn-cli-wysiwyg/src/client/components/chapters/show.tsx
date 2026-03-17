import { ChapterHeader } from './show/ChapterHeader';
import { ErrorMessage } from '../ErrorMessage';
import { Loading } from '../Loading';
import { useChapterChangedEffect } from '../../hooks/useLocalFileChangedEffect';
import { useFetch } from '../../hooks/useFetch';
import { useTitle } from '../../hooks/useTitle';
import { Book, Chapter } from 'zenn-model';
import { ChapterContent } from './show/ChapterContent';
import { useState } from 'react';

type ChapterShowProps = {
  bookSlug: string;
  chapterFilename: string;
};

export const ChapterShow: React.FC<ChapterShowProps> = ({
  bookSlug,
  chapterFilename,
}) => {
  const {
    data: bookData,
    error: bookError,
    isValidating: isValidatingBook,
    mutate: mutateBook,
  } = useFetch<{ book: Book }>(`/api/books/${bookSlug}`, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
  });
  const book = bookData?.book;

  const {
    data: chapterData,
    error: chapterError,
    isValidating: isValidatingChapter,
    mutate: mutateChapter,
  } = useFetch<{ chapter: Chapter }>(
    `/api/books/${bookSlug}/chapters/${chapterFilename}`,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 3,
    }
  );

  const chapter = chapterData?.chapter;

  const [localChapterChangedAt, setLocalChapterChangedAt] =
    useState<number>(0);

  useTitle(`${chapter?.title || chapterFilename}のプレビュー`);

  // refetch when local file changes
  useChapterChangedEffect((chapterEvent) => {
    const chapter = chapterEvent.chapter;
    if (bookSlug !== chapterEvent.bookSlug) return;
    if (chapterFilename !== chapter.filename) return;

    mutateBook();
    mutateChapter(
      {
        chapter,
      },
      false
    );

    if (chapterEvent.type === 'localChapterFileChanged') {
      // ローカルファイルが更新された場合は、エディタを再レンダリングするためにキーを更新
      setLocalChapterChangedAt(new Date().getTime());
    }
  });

  if (!book) {
    if (isValidatingBook) return <Loading margin="5rem auto" />;
    return (
      <ErrorMessage
        message={
          bookError?.message || `本 ${bookSlug} のデータを取得できませんでした`
        }
      />
    );
  }

  if (!chapter) {
    if (isValidatingChapter) return <Loading margin="5rem auto" />;
    return (
      <ErrorMessage
        message={
          chapterError?.message ||
          `チャプター ${chapterFilename} のデータを取得できませんでした`
        }
      />
    );
  }

  return (
    <>
      <ChapterHeader book={book} chapter={chapter} />
      <ChapterContent
        key={chapter.filename}
        book={book}
        chapter={chapter}
        localChapterChangedAt={localChapterChangedAt}
      />
    </>
  );
};
