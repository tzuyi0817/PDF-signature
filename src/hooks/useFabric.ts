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
const fabricImagePool = new Set<fabric.Image>();

export default function useFabric(id: string) {
  const pages = ref(1);

  function createCanvas() {
    if (fabricMap.has(id)) {
      return fabricMap.get(id)?.initialize(id);
    }
    const canvas = new fabric.Canvas(id);

    fabricMap.set(id, canvas);
    canvas.on('selection:cleared', () => clearPool(canvas));
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

  function addFabric(src: string) {
    const canvas = fabricMap.get(id);
    if (!canvas) return;
    fabric.Image.fromURL(src, (image) => {
      image.top = 100;
      image.left = 50;
      image.scaleX = 0.5;
      image.scaleY = 0.5;
      image.borderColor = 'black';
      image.cornerStrokeColor = 'black';
      image.cornerSize = 8;
      image.selectionBackgroundColor = 'rgba(245, 245, 245, 0.8)';
      canvas.add(image);
      setFabric(canvas, image);
    });
  }

  function addTextFabric(text: string) {
    const canvas = fabricMap.get(id);
    if (!canvas) return;
    const textFabric = new fabric.Text(text, {
      top: 100,
      left: 50,
      fontFamily: 'helvetica',
      borderColor: 'black',
      cornerStrokeColor: 'black',
      cornerSize: 8,
      selectionBackgroundColor: 'rgba(245, 245, 245, 0.8)',
    });

    canvas.add(textFabric);
    setFabric(canvas, textFabric);
  }

  function setFabric(canvas: fabric.Canvas, fab: fabric.Image | fabric.Text) {
    let icon: fabric.Image | null = null;

    fab.on('selected', async (event) => icon = await createIcon(canvas, event, fab));
    fab.on('modified', (event) => moveIcon(event, icon));
    fab.on('scaling', (event) => moveIcon(event, icon));
    fab.on('moving', (event) => moveIcon(event, icon));
    fab.on('rotating', (event) => moveIcon(event, icon));
  }

  async function createIcon(
    canvas: fabric.Canvas,
    event: fabric.IEvent<Event>,
    fab: fabric.Image | fabric.Text
  ): Promise<fabric.Image> {
    const src = '/src/assets/icon/ic_close_s.svg';

    return new Promise(resolve => {
      fabric.Image.fromURL(src, (icon) => {
        moveIcon(event, icon)
        icon.on('selected', () => {
          canvas.remove(fab);
          deleteIcon(canvas, icon);
        });
        clearPool(canvas);
        canvas.add(icon);
        fabricImagePool.add(icon);
        resolve(icon);
      });
    });
  }

  function moveIcon(event: fabric.IEvent<Event>, icon: fabric.Image | null) {
    if (!icon) return;
    // @ts-ignore
    const { oCoords, angle, width, height } = event.transform?.target ?? event.target;
    const { x, y } = oCoords?.tl!;
    const offsetX = Math.cos(angle * (Math.PI / 180)) * (width / 30);
    const offsetY = Math.sin(angle * (Math.PI / 180)) * (height / 30);

    icon.top = y - offsetY - 35;
    icon.left = x - offsetX - 15;
  }

  function deleteIcon(canvas: fabric.Canvas, icon: fabric.Image) {
    canvas.remove(icon);
    fabricImagePool.delete(icon);
  }

  function clearPool(canvas: fabric.Canvas) {
    fabricImagePool.forEach(image => canvas.remove(image));
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
    addFabric,
    addTextFabric,
    pages,
  }
}
