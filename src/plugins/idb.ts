import { usePdfStore } from '@/store';

export default {
  install() {
    const { getCurrentPDF, getPDF, getArchive, getTrash } = usePdfStore();

    return Promise.all([getCurrentPDF(), getPDF(), getArchive(), getTrash()]);
  },
};
