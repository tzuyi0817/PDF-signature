import { jsPDF, type jsPDFOptions } from 'jspdf';
import { A4_HEIGHT, A4_WIDTH } from '@/constants/common';
import type { PDF } from '@/types/pdf';
import { sleep } from './common';

export async function downloadPDF(doc: PDF, setCompleteness?: (value: number) => void, password?: string) {
  const { name, canvas } = doc;

  if (!canvas) return;

  const options: jsPDFOptions = {
    orientation: 'p',
    unit: 'mm',
    format: [doc.width || A4_WIDTH, doc.height || A4_HEIGHT],
    compress: true,
  };

  if (password) {
    options.encryption = {
      userPassword: password,
      ownerPassword: password,
      userPermissions: ['print', 'copy'],
    };
  }
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

async function setPdf(pdf: jsPDF, blob: Blob, isLast: boolean) {
  const { width, height } = pdf.internal.pageSize;
  const arrayBuffer = await blobToArrayBuffer(blob);
  const uint8Array = new Uint8Array(arrayBuffer);

  pdf.addImage(uint8Array, 'PNG', 0, 0, width, height, undefined, 'SLOW');

  if (isLast) return;

  pdf.addPage();
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
