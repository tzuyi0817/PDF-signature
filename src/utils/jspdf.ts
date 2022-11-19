import { jsPDF } from 'jspdf';
import type { PDF } from '@/types/pdf';

export function downloadPDF(doc: PDF) {
  const PDF = new jsPDF();
  const width = PDF.internal.pageSize.width;
  const height = PDF.internal.pageSize.height;
  const { name, canvas } = doc;

  if (!canvas) return;
  canvas.forEach((image, index) => {
    PDF.addImage(image, 'png', 0, 0, width, height)
    index !== canvas.length - 1 && PDF.addPage();
  });
  PDF.save(`${name}.pdf`);
}
