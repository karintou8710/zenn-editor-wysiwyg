import React from 'react';
import styled from 'styled-components';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { usePersistedState } from '../hooks/usePersistedState';
import { TocNode } from 'zenn-model/lib/types';

const TocList: React.FC<{
  toc: TocNode[];
  depth?: number;
  maxDepth: number;
}> = ({ toc, depth = 1, maxDepth }) => {
  return (
    <ol className={`toc__ol-depth-${depth}`}>
      {toc.map((node) => {
        return (
          <li key={node.id}>
            <div className="toc__list-item">
              <a className="toc__list-item__id-link" href={`#${node.id}`}>
                {node.text}
              </a>
            </div>
            {depth < maxDepth && node.children.length > 0 && (
              <TocList
                toc={node.children}
                maxDepth={maxDepth}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
};

type TocProps = {
  toc: TocNode[];
  maxDepth: number;
};
/**
 * @param toc TocNodeの配列
 * @param maxDepth 最大何層目までの見出しを目次に含めるか
 */
export const Toc: React.FC<TocProps> = ({ ...tocListProps }) => {
  const [isTocFolded, setIsTocFolded] = usePersistedState<boolean>({
    cacheKey: 'fold-toc',
    defaultValue: false,
  });
  return (
    <BodyStyledToc className="toc-container">
      <div className={isTocFolded ? 'container-closed' : 'container-open'}>
        <div
          className="title-container"
          onClick={() => setIsTocFolded(!isTocFolded)}
        >
          目次のプレビュー
          <MdKeyboardArrowDown
            size={24}
            className="title-container__toggle-icon"
          />
        </div>

        <div className="toc">
          <TocList {...tocListProps} />
        </div>
      </div>
    </BodyStyledToc>
  );
};

const BodyStyledToc = styled.div`
  border: solid 1px var(--c-gray-border);
  overflow: hidden;
  margin-bottom: 1.8rem;
  line-height: 1.5;
  border-radius: 7px;

  .container-open {
    box-shadow: none;
    .title-container {
      background: var(--c-gray-bg);
    }
    .toc {
      display: block;
    }
    .title-container__toggle-icon {
      transform: rotate(180deg);
    }
  }

  .container-closed {
    .toc {
      display: none;
    }
  }

  .title-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.7rem 1.1rem;
    font-size: 0.9rem;
    cursor: pointer;
    font-weight: 700;
    .title-container__toggle-icon {
      transition: 0.3s;
    }
  }

  .toc {
    padding: 0.7rem 1.1rem;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--c-gray);
    a {
      color: inherit;
      &:hover {
        color: var(--c-body);
        text-decoration: underline;
      }
    }
    li {
      padding: 0.35em 0;
      list-style: disc;
      margin-left: 1.3rem;
      li {
        list-style: none;
        margin-left: 0.1em;
        padding: 0.4em 0 0.1em 0.9em;
        position: relative;

        &:before {
          position: absolute;
          content: '-';
          left: 0;
          flex-shrink: 0;
          margin-right: 0.5em;
          color: var(--c-gray-lighter);
        }
      }
    }
    .toc__list-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.21rem;
      .toc__list-item__id-link {
        display: block;
      }
      .toc__list-item__id-copy-button {
        opacity: 0;
        display: block;
        flex-shrink: 0;
        &:hover {
          background-color: transparent;
        }
      }
    }
  }
  .toc:hover {
    .toc__list-item__id-copy-button {
      opacity: 1;
      transition: all 0.2s;
    }
  }
`;
