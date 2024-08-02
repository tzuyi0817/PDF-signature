import usePdfStore from '@/store/pdf';
import useSignatureStore from '@/store/signature';
import useImageStore from '@/store/image';
import useLiteralStore from '@/store/literal';
import useConfigStore from '@/store/config';

export type UsePdfStore = typeof usePdfStore;

export { usePdfStore, useSignatureStore, useImageStore, useLiteralStore, useConfigStore };
