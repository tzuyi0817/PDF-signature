import { createPinia as create } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import { STORAGE_PREFIX } from './constants';
import * as pdfStore from './modules/pdf';
export { useConfigStore } from './modules/config';
export { useImageStore } from './modules/image';
export { useLiteralStore } from './modules/literal';
export { useSignatureStore } from './modules/signature';

export type PdfStore = typeof pdfStore;
export const { usePdfStore } = pdfStore;

export function createPinia() {
  const pinia = create();
  const persistedState = createPersistedState({
    key: storeKey => `${STORAGE_PREFIX}_${storeKey}`,
  });

  pinia.use(persistedState);

  return pinia;
}
