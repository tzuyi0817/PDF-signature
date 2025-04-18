import { jsPDF, type jsPDFOptions } from 'jspdf';
import type { PDF } from '@/types/pdf';
import { sleep } from './common';

export async function downloadPDF(doc: PDF, setCompleteness?: (value: number) => void, password?: string) {
  const { name, canvas } = doc;

  if (!canvas) return;
  const options: jsPDFOptions = {
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
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
    const image = canvas[index];
    const isLast = index === pages - 1;

    await setPdf(pdf, image, isLast);
    setCompleteness?.(((index + 1) / pages) * 100);
    await sleep(150);
  }
  pdf.save(`${name}.pdf`);
}

async function setPdf(pdf: jsPDF, image: string, isLast: boolean) {
  const { width, height } = pdf.internal.pageSize;

  await sleep(0);
  pdf.addImage(image, 'PNG', 0, 0, width, height, undefined, 'SLOW');
  if (isLast) return;
  pdf.addPage();
}
