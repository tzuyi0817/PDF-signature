import { useFolderStore, usePdfStore } from '@/stores';
import { loadImage } from '@/utils/image';

export function preloadStorage() {
  const { getCurrentPDF, getPDF, getArchive, getTrash } = usePdfStore();
  const { getFolders } = useFolderStore();

  return Promise.all([getCurrentPDF(), getPDF(), getArchive(), getTrash(), getFolders()]).then(() => {});
}

export function preloadImages() {
  const images = import.meta.glob<string>('@/assets/img/*', {
    eager: true,
    query: '?url',
    import: 'default',
  });
  const promises = Object.values(images).map(loadImage);

  return Promise.allSettled(promises).then(() => {});
}
