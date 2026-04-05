export function setSelection(dom: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(dom);
  const selection = window.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
}

export async function waitSelectionChange(fn: () => void | Promise<void>) {
  await fn();
  await waitForFrameCommit();
}

function waitForFrameCommit() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}
