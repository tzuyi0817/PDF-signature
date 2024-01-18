export function createImageSrc(url: string) {
  return new URL(`/src/assets/${url}`, import.meta.url).href;
}

export function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const blobURL = window.URL.createObjectURL(file);
    const image = new Image();

    image.src = blobURL;
    image.onload = async () => {
      window.URL.revokeObjectURL(blobURL);
      resolve(await compressImage(image));
    };
    image.onerror = error => {
      window.URL.revokeObjectURL(blobURL);
      reject(error);
    };
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
