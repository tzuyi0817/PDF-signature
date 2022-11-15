window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/PDFjs/pdf.worker.js';

export async function printPDF(file: File): Promise<HTMLCanvasElement | void> {
  const Base64Prefix = 'data:application/pdf;base64,';
  const pdf = await readBlob(file);
  if (typeof pdf !== 'string') return;
  const data = window.atob(pdf.slice(Base64Prefix.length));
  const pdfDoc = await window.pdfjsLib.getDocument({ data }).promise;
  const pdfPage = await pdfDoc.getPage(1);
  const viewport = pdfPage.getViewport({ scale: 1 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const renderContext = {
    canvasContext: context,
    viewport,
  };
  const renderTask = pdfPage.render(renderContext);

  canvas.height = viewport.height;
  canvas.width = viewport.width;
  return renderTask.promise.then(() => canvas);
}

function readBlob(file: File): Promise<FileReader['result']> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  })
}
