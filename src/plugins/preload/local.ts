import { usePdfStore } from '@/store';

export function setupLocalFiles() {
  const { getCurrentPDF, getPDF, getArchive, getTrash } = usePdfStore();

  return Promise.all([getCurrentPDF(), getPDF(), getArchive(), getTrash()]);
}
