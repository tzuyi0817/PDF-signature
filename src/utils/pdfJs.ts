import * as pdfjsLib from 'pdfjs-dist';
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs';
import { readfile } from './reader';

window.pdfjsWorker = pdfjsWorker;

export async function printPDF(file: File): Promise<string | void> {
  const Base64Prefix = 'data:application/pdf;base64,';
  const pdf = await readfile(file);
  if (typeof pdf !== 'string') return;

  return window.atob(pdf.slice(Base64Prefix.length));
}

export function getPDFDocument(data: string) {
  return pdfjsLib.getDocument({ data }).promise;
}
