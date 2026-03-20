import type { DetachedWindowAPI } from 'happy-dom';
import { beforeAll } from 'vitest';

declare global {
  interface Window {
    happyDOM: DetachedWindowAPI;
  }
}

beforeAll(() => {
  // Node テストでは iframe の外部読み込みを止めて happy-dom の NetworkError を防ぐ。
  window.happyDOM.settings.navigation.disableChildFrameNavigation = true;
});
