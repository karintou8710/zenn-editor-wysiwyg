import {
  WS_ClientMessage,
  WS_ServerMessage,
  WS_ServerMessageType,
} from 'common/types';
import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Article } from 'zenn-model';

type ReloadedAt = number;
type ArticleEvent = {
  type: WS_ServerMessageType;
  article: Article;
};
type WebSocketSendResult = { ok: true } | { ok: false; reason: string };

const HotReloadContext = createContext<{
  reloadedAt: ReloadedAt;
  articleEvent: ArticleEvent | null;
  connection: {
    sendJson: (message: WS_ClientMessage) => WebSocketSendResult;
  };
}>({
  reloadedAt: 0,
  articleEvent: null,
  connection: {
    sendJson: () => ({ ok: false, reason: 'not-initialized' }),
  },
});

const buildWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
};

const useHotReloadConnection = () => {
  const [reloadedAt, setReloadedAt] = useState<ReloadedAt>(0);
  const [articleEvent, setArticleEvent] = useState<ArticleEvent | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);

  const handleMessage = useCallback((ev: MessageEvent) => {
    let res: WS_ServerMessage;
    try {
      res = JSON.parse(ev.data) as WS_ServerMessage;
    } catch (error) {
      console.error('Failed to parse websocket message', error);
      return;
    }

    if (res.type === 'localArticleFileChanged' || res.type === 'articleSaved') {
      setReloadedAt(Date.now());
      setArticleEvent({
        type: res.type,
        article: res.data.article,
      });
    }
  }, []);

  const teardownSocket = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
  }, []);

  const connect = useCallback(() => {
    const websocket = new WebSocket(buildWebSocketUrl());
    socketRef.current = websocket;

    const handleClose = () => {
      socketRef.current = null;
      if (!shouldReconnectRef.current) return;

      reconnectTimerRef.current = window.setTimeout(connect, 1000);
    };

    websocket.addEventListener('message', handleMessage);
    websocket.addEventListener('close', handleClose);
    websocket.addEventListener('error', handleClose);
  }, [handleMessage]);

  useEffect(() => {
    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      teardownSocket();
    };
  }, [connect, teardownSocket]);

  const sendJson = useCallback(
    (message: WS_ClientMessage): WebSocketSendResult => {
      const current = socketRef.current;
      if (!current) {
        return { ok: false, reason: 'socket-not-ready' };
      }
      if (current.readyState !== WebSocket.OPEN) {
        return {
          ok: false,
          reason: `socket-state-${current.readyState}`,
        };
      }

      current.send(JSON.stringify(message));
      return { ok: true };
    },
    []
  );

  return useMemo(
    () => ({
      reloadedAt,
      articleEvent,
      connection: {
        sendJson,
      },
    }),
    [articleEvent, reloadedAt, sendJson]
  );
};

export const HotReloadRoot: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const hotReload = useHotReloadConnection();

  return (
    <HotReloadContext.Provider value={hotReload}>
      {children}
    </HotReloadContext.Provider>
  );
};

export function useArticleChangedEffect(
  fn: (articleEvent: ArticleEvent) => void
) {
  const { articleEvent } = useContext(HotReloadContext);

  useEffect(() => {
    if (articleEvent !== null) fn(articleEvent);
  }, [articleEvent]);
}

export function useLocalFileChangedEffect(fn: () => void) {
  const { reloadedAt } = useContext(HotReloadContext);

  useEffect(() => {
    if (reloadedAt !== 0) fn();
  }, [reloadedAt]);
}

export function useWebSocket() {
  const {
    connection: { sendJson },
  } = useContext(HotReloadContext);

  return { sendJson };
}
