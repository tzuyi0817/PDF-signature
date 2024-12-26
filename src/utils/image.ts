export function createImageSrc(url: string) {
  return new URL(`/src/assets/${url}`, import.meta.url).href;
}

export function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const blobURL = window.URL.createObjectURL(file);
    const image = new Image();

    image.src = blobURL;
    image.addEventListener('load', async () => {
      window.URL.revokeObjectURL(blobURL);
      resolve(await compressImage(image));
    });
    image.addEventListener('error', error => {
      window.URL.revokeObjectURL(blobURL);
      reject(error);
    });
  });
}

function compressImage(image: HTMLImageElement): Promise<string> {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const { naturalWidth, naturalHeight } = image;

    canvas.width = naturalWidth;
    canvas.height = naturalHeight;
    context?.drawImage(image, 0, 0, naturalWidth, naturalHeight);
    resolve(canvas.toDataURL('image/jpeg', 0.8));
  });
}

export function canvasToFile(
  canvas: HTMLCanvasElement,
  type = 'image/png',
  quality = 1,
  filename = 'image.png',
): Promise<File> {
  return new Promise(resolve => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          throw new Error('Failed to convert canvas to blob');
        }
        const file = new File([blob], filename, { type });

        resolve(file);
      },
      type,
      quality,
    );
  });
}

export function loadImage(src: string) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener('load', resolve);
    image.addEventListener('error', reject);
    image.src = src;
  });
}
