export async function waitForBrowserRender(): Promise<void> {
  await new Promise<number>(requestAnimationFrame);
  await new Promise<number>(requestAnimationFrame);
}
