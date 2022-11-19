import type { PDFDocumentProxy } from '@/types/pdf';

window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/PDFjs/pdf.worker.js';

export async function printPDF(file: File): Promise<string | void> {
  const Base64Prefix = 'data:application/pdf;base64,';
  const pdf = await readBlob(file);
  if (typeof pdf !== 'string') return;

  return window.atob(pdf.slice(Base64Prefix.length));
}

export async function getPDFDocument(data: string): Promise<PDFDocumentProxy> {
  return await window.pdfjsLib.getDocument({ data }).promise;
}

export function readBlob(file: File): Promise<FileReader['result']> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  })
}
