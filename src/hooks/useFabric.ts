import { ref, toRaw } from 'vue';
import { fabric } from 'fabric';
import { printPDF, getPDFDocument } from '@/utils/pdfJs';
import { usePdfStore } from '@/store';
import type { PDF } from '@/types/pdf';

const fabricMap = new Map();

export default function useFabric(id: string) {
  const currentId = ref('');
  const pages = ref(1);

  function createCanvas() {
    if (fabricMap.has(id)) return;
    fabricMap.set(id, new fabric.Canvas(id));
  }

  async function drawPDF(file: File) {
    const canvas = fabricMap.get(id);

    canvas.requestRenderAll();
    const PDFBase64 = await printPDF(file);
    if (!PDFBase64) return;
    const now = Date.now();
    const PDFId = `${file.name}${now}`;
    const PDF = {
      PDFId,
      name: file.name.replace(/.pdf/, ''),
      updateDate: now,
      PDFBase64,
    };

    await specifyPage(1, PDF);
    currentId.value = PDFId;
  }

  async function specifyPage(page: number, PDF: Omit<PDF, 'pages'> | PDF) {
    const pdfDoc = await getPDFDocument(PDF.PDFBase64);
    const pdfPage = await toRaw(pdfDoc).getPage(page);
    const viewport = pdfPage.getViewport({ scale: 1 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const renderContext = {
      canvasContext: context!,
      viewport,
    };
    const renderTask = pdfPage.render(renderContext);
    const { addPDF } = usePdfStore();

    canvas.height = viewport.height;
    canvas.width = viewport.width;
    renderTask.promise.then(() => renderPDF(canvas));
    pages.value = pdfDoc.numPages;
    addPDF({ ...PDF, pages: pdfDoc.numPages });
  }

  function renderPDF(pdfCanvas: HTMLCanvasElement) {
    const canvas = fabricMap.get(id);
    const pdfImage = pdfToImage(pdfCanvas);

    canvas.setWidth(pdfImage.width! / window.devicePixelRatio);
    canvas.setHeight(pdfImage.height! / window.devicePixelRatio);
    canvas.setBackgroundImage(pdfImage, canvas.renderAll.bind(canvas));
  } 

  function pdfToImage(pdfData: HTMLCanvasElement) {
    const scale = 1 / window.devicePixelRatio;
  
    return new fabric.Image(pdfData, {
      scaleX: scale,
      scaleY: scale,
    });
  }
  
  function drawImage(file: File) {
  
  }

  function removeCanvas(id: string) {
    fabricMap.delete(id);
  }

  return {
    createCanvas,
    drawPDF,
    drawImage,
    removeCanvas,
    specifyPage,
    pages,
    currentId,
  }
}