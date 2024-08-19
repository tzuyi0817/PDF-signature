import * as pdfStore from '@/store/pdf';
import { useSignatureStore } from '@/store/signature';
import { useImageStore } from '@/store/image';
import { useLiteralStore } from '@/store/literal';
import { useConfigStore } from '@/store/config';

export type PdfStore = typeof pdfStore;

export const { usePdfStore } = pdfStore;

export { useSignatureStore, useImageStore, useLiteralStore, useConfigStore };
