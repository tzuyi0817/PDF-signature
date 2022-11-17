import { ref, toRaw } from 'vue';
import { fabric } from 'fabric';
import { printPDF, getPDFDocument } from '@/utils/pdfJs';
import { usePdfStore } from '@/store';
import type { PDF } from '@/types/pdf';

interface SpecifyPageArgs {
  page: number;
  PDF: Omit<PDF, 'pages'> | PDF;
  scale?: number;
}

const fabricMap = new Map<string, fabric.Canvas>();

export default function useFabric(id: string) {
  const pages = ref(1);

  function createCanvas() {
    if (fabricMap.has(id)) {
      return fabricMap.get(id)?.initialize(id);
    }
    const canvas = new fabric.Canvas(id);

    fabricMap.set(id, canvas);
    return canvas;
  }

  async function drawPDF(file: File) {
    const canvas = fabricMap.get(id);
    if (!canvas) return;
    canvas.requestRenderAll();
    const PDFBase64 = await printPDF(file);
    if (!PDFBase64) return;
    const { setCurrentPDF } = usePdfStore();
    const now = Date.now();
    const PDFId = `${file.name}${now}`;
    const PDF = {
      PDFId,
      name: file.name.replace(/.pdf/, ''),
      updateDate: now,
      PDFBase64,
    };

    await specifyPage({ page: 1, PDF });
    setCurrentPDF({ ...PDF, pages: pages.value });
  }

  async function specifyPage({ page, PDF, scale = 1 }: SpecifyPageArgs) {
    const pdfDoc = await getPDFDocument(PDF.PDFBase64);
    const pdfPage = await toRaw(pdfDoc).getPage(page);
    const viewport = pdfPage.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const renderContext = {
      canvasContext: context!,
      viewport,
    };
    const renderTask = pdfPage.render(renderContext);

    canvas.height = viewport.height;
    canvas.width = viewport.width;
    pages.value = pdfDoc.numPages;
    return renderTask.promise.then(() => renderPDF(canvas));
  }

  function renderPDF(pdfCanvas: HTMLCanvasElement) {
    const canvas = fabricMap.get(id);
    if (!canvas) return;
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
  }
}