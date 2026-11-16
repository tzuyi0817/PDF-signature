import type { PDF } from '@/types/pdf';

/** 文件是否保有原始檔；此變更前儲存的文件只有整頁 PNG，回傳 false */
export function hasOriginalPDF(pdf: PDF): pdf is PDF & { data: File } {
  return Boolean(pdf.data);
}
