import { jsPDF } from 'jspdf';
import { sleep } from './common';
import type { PDF } from '@/types/pdf';

export function downloadPDF(doc: PDF, setCompleteness?: (value: number) => void) {
  return new Promise(async resolve => {
    const { name, canvas } = doc;

    if (!canvas) return;
    const pdf = new jsPDF('p', 'mm', 'a4', true);
    const pages = canvas.length;

    for (let index = 0; index < pages; index++) {
      const image = canvas[index];
      const isLast = index === pages - 1;

      await setPdf(pdf, image, isLast);
      setCompleteness?.(((index + 1) / pages) * 100);
      await sleep(150);
    }
    resolve(pdf.save(`${name}.pdf`));
  });
}

async function setPdf(pdf: jsPDF, image: string, isLast: boolean) {
  const { width, height } = pdf.internal.pageSize;

  await sleep(0);
  pdf.addImage(image, 'PNG', 0, 0, width, height, undefined, 'SLOW');
  if (isLast) return;
  pdf.addPage();
}
