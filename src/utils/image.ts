export function createImageSrc(url: string) {
  return new URL(url, import.meta.url).href;
}
