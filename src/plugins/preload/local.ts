import { usePdfStore } from '@/store';
import { loadImage } from '@/utils/image';

export function preloadStorage() {
  const { getCurrentPDF, getPDF, getArchive, getTrash } = usePdfStore();

  return Promise.all([getCurrentPDF(), getPDF(), getArchive(), getTrash()]);
}

export function preloadImages() {
  const images = import.meta.glob('@/assets/img/*', { eager: true, as: 'url' });
  const promises = Object.values(images).map(loadImage);

  return Promise.allSettled(promises);
}
