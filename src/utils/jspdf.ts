import { jsPDF, type jsPDFOptions } from 'jspdf';
import { A4_HEIGHT, A4_WIDTH } from '@/constants/common';
import { sleep } from './common';
import type { PDF } from '@/types/pdf';

export async function downloadPDF(doc: PDF, setCompleteness?: (value: number) => void, password?: string) {
  const { name, canvas } = doc;

  if (!canvas) return;

  const options = getOptions(doc, password);
  const pdf = new jsPDF(options);
  const pages = canvas.length;

  for (let index = 0; index < pages; index++) {
    const blob = canvas[index];
    const isLast = index === pages - 1;

    if (blob) {
      await setPdf(pdf, blob, isLast);
    }

    setCompleteness?.(((index + 1) / pages) * 100);
    await sleep(50);
  }

  pdf.save(`${name}.pdf`);
}

export async function generatePDF(doc: PDF) {
  const { canvas, name } = doc;

  if (!canvas) return;

  const options = getOptions(doc);
  const pdf = new jsPDF(options);
  const pages = canvas.length;

  for (let index = 0; index < pages; index++) {
    const blob = canvas[index];
    const isLast = index === pages - 1;

    if (blob) {
      await setPdf(pdf, blob, isLast);
    }
  }

  const blob = pdf.output('blob');

  return new File([blob], `${name}.pdf`, { type: blob.type });
}

async function setPdf(pdf: jsPDF, blob: Blob, isLast: boolean) {
  const { width, height } = pdf.internal.pageSize;
  const arrayBuffer = await blobToArrayBuffer(blob);
  const uint8Array = new Uint8Array(arrayBuffer);

  pdf.addImage(uint8Array, 'PNG', 0, 0, width, height, undefined, 'SLOW');

  if (isLast) return;

  pdf.addPage();
}

function getOptions(doc: PDF, password?: string) {
  const width = doc.width || A4_WIDTH;
  const height = doc.height || A4_HEIGHT;
  const orientation = width > height ? 'l' : 'p';
  const options: jsPDFOptions = {
    orientation,
    unit: 'mm',
    format: [width, height],
    compress: true,
  };

  if (password) {
    options.encryption = {
      userPassword: password,
      ownerPassword: password,
      userPermissions: ['print', 'copy'],
    };
  }

  return options;
}

export function blobToArrayBuffer(file: Blob): Promise<ArrayBuffer> {
  if (file.arrayBuffer) {
    return file.arrayBuffer();
  }

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('load', () => {
      const result = fileReader.result;

      if (!(result instanceof ArrayBuffer)) {
        reject(new Error('Failed to read file as ArrayBuffer.'));
        return;
      }

      resolve(result);
    });
    fileReader.addEventListener('error', reject);
    fileReader.readAsArrayBuffer(file);
  });
}
