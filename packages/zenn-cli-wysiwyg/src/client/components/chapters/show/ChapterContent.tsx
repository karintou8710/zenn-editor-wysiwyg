import styled from 'styled-components';
import { EditableBodyContent } from '../../EditableBodyContent';
import { BodyContent } from '../../BodyContent';
import { Switch } from '../../Switch';
import { Book, Chapter } from 'zenn-model';
import { useCallback, useState } from 'react';
import { useWebSocket } from '../../../hooks/useLocalFileChangedEffect';
import { ContentContainer } from '../../ContentContainer';
import { WS_ChapterPostMessage } from 'common/types';
import { uploadImage } from '../../../lib/api';
import { showToast } from '../../../lib/toast';
import { type Message } from 'zenn-wysiwyg-editor';

interface ChapterContentProps {
  book: Book;
  chapter: Chapter;
  localChapterChangedAt: number; // 直接ファイルが更新された時に、エディタを再レンダリングするためのキー
}

export const ChapterContent: React.FC<ChapterContentProps> = ({
  book,
  chapter,
  localChapterChangedAt,
}) => {
  const [isEditable, setIsEditable] = useState(false);
  const { sendJson } = useWebSocket();

  const handleContentChange = useCallback(
    (markdown: string) => {
      // 本番環境でのみWebSocket連携
      if (import.meta.env.MODE === 'production') {
        const req: WS_ChapterPostMessage = {
          type: 'chapterContentChanged',
          data: { bookSlug: book.slug, chapter: { ...chapter, markdown } },
        };

        const result = sendJson(req);
        if (!result.ok) {
          showToast(
            'チャプターの保存に失敗しました。ページをリロードしてください。',
            'error'
          );
          console.error('WebSocket send failed.', `reason=${result.reason}`);
          return;
        }
      }
    },
    [book.slug, chapter, sendJson]
  );

  const handleImageUpload = useCallback(
    async (file: File) => {
      const url = await uploadImage(file, chapter.slug);
      return url;
    },
    [chapter.slug]
  );

  const handleMessage = useCallback((message: Message) => {
    if (message.type === 'alert') {
      showToast(message.text, 'error');
    } else if (message.type === 'info') {
      showToast(message.text, 'info');
    }
  }, []);

  return (
    <ContentContainer>
      <StyledChapterShow className="chapter-show">
        <div className="chapter-show__content">
          <StyledEditMode>
            <StyledHelpLink
              href="https://zenn.dev/karintou/articles/eabe0354fcc947"
              target="_blank"
              rel="noreferrer"
            >
              ?
            </StyledHelpLink>

            <StyledLabel>編集モード</StyledLabel>
            <Switch checked={isEditable} onChange={setIsEditable} />
          </StyledEditMode>

          {isEditable ? (
            <EditableBodyContent
              key={localChapterChangedAt}
              markdown={chapter.markdown ?? ''}
              onChange={handleContentChange}
              onImageUpload={handleImageUpload}
              onMessage={handleMessage}
            />
          ) : (
            <BodyContent rawHtml={chapter.bodyHtml || ''} />
          )}
        </div>
      </StyledChapterShow>
    </ContentContainer>
  );
};

const StyledHelpLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9999px;
  background-color: var(--c-primary-bg);
  color: var(--c-primary);
  font-weight: bold;

  &:hover {
    opacity: 0.8;
  }
`;

const StyledChapterShow = styled.div`
  .chapter-show__content {
    padding: 3rem 0 10rem;
  }
`;

const StyledEditMode = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StyledLabel = styled.label`
  cursor: pointer;
  border-bottom: 1px dashed var(--c-gray-border);
`;
