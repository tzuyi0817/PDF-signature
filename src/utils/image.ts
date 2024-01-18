import { readfile, checkFile } from './reader';

export function createImageSrc(url: string) {
  return new URL(`/src/assets/${url}`, import.meta.url).href;
}

export function convertToBase64(files?: FileList | null): Promise<FileReader['result']> | void {
  const file = checkFile(files, /.png|.jpg|.jpeg/);

  if (!file) return;
  return readfile(file);
}
