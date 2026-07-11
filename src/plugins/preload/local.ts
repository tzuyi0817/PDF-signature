import { useFolderStore, usePdfStore } from '@/stores';
import { loadImage } from '@/utils/image';

export async function preloadStorage() {
  const { getCurrentPDF, getPDF, getArchive, getTrash } = usePdfStore();
  const { getFolders } = useFolderStore();

  await Promise.all([getCurrentPDF(), getPDF(), getArchive(), getTrash(), getFolders()]);
}

export async function preloadImages() {
  const images = import.meta.glob<string>('@/assets/img/*', {
    eager: true,
    query: '?url',
    import: 'default',
  });
  const promises = Object.values(images).map(loadImage);

  await Promise.allSettled(promises);
}
