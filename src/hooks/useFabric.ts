import { ref, toRaw } from 'vue';
import { fabric } from 'fabric';
import { printPDF, getPDFDocument, readBlob } from '@/utils/pdfJs';
import { usePdfStore } from '@/store';
import { createImageSrc } from '@/utils/image';
import type { PDF } from '@/types/pdf';

interface SpecifyPageArgs {
  page: number;
  PDF: Omit<PDF, 'pages'> | PDF;
  scale?: number;
}

interface RenderImageArgs {
  url: string;
  scale?: number;
}

const fabricMap = new Map<string, fabric.Canvas>();
const fabricImagePool = new Set<fabric.Object | fabric.Group>();

export default function useFabric(id: string) {
  const pages = ref(1);

  function createCanvas() {
    if (fabricMap.has(id)) return;
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
    return renderTask.promise.then(() => renderCanvas(canvas));
  }

  function renderCanvas(canvasTemp: HTMLCanvasElement) {
    const canvas = fabricMap.get(id);
    if (!canvas) return;
    const image = canvasToImage(canvasTemp);

    canvas.setWidth(image.width! / 3);
    canvas.setHeight(image.height! / 3);
    canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas));
  }

  function canvasToImage(canvasTemp: HTMLCanvasElement) {
    const scale = 1 / 3;

    return new fabric.Image(canvasTemp, {
      scaleX: scale,
      scaleY: scale,
    });
  }

  async function drawImage(file: File) {
    const base64 = (await readBlob(file)) as string;
    const { setCurrentPDF } = usePdfStore();
    const now = Date.now();
    const PDFId = `${file.name}${now}`;
    const PDF = {
      PDFId,
      name: file.name.replace(/.png|.jpg|.jpeg/, ''),
      updateDate: now,
      PDFBase64: base64,
    };

    renderImage({ url: base64 });
    setCurrentPDF({ ...PDF, pages: pages.value });
  }

  function renderImage({ url, scale = 0.5 }: RenderImageArgs) {
    const canvas = fabricMap.get(id);
    if (!canvas) return;
    fabric.Image.fromURL(url, image => {
      image.scale(scale);
      canvas.setWidth(image.width! * scale);
      canvas.setHeight(image.height! * scale);
      canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas));
    });
  }

  function addFabric(src: string, position = { x: 100, y: 50 }) {
    const canvas = fabricMap.get(id);
    if (!canvas) return;
    fabric.Image.fromURL(src, image => {
      image.top = position.y;
      image.left = position.x;
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

  function addTextFabric(text: string, position = { x: 100, y: 50 }) {
    const canvas = fabricMap.get(id);
    if (!canvas) return;
    const textFabric = new fabric.Text(text, {
      top: position.y,
      left: position.x,
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
    let closeSvg: fabric.Object | fabric.Group | null = null;

    fab.on('selected', async event => (closeSvg = await createCloseSvg(canvas, event, fab)));
    fab.on('modified', event => moveCloseSvg(event, closeSvg));
    fab.on('scaling', event => moveCloseSvg(event, closeSvg));
    fab.on('moving', event => moveCloseSvg(event, closeSvg));
    fab.on('rotating', event => moveCloseSvg(event, closeSvg));
  }

  async function createCloseSvg(
    canvas: fabric.Canvas,
    event: fabric.IEvent<Event>,
    fab: fabric.Image | fabric.Text,
  ): Promise<fabric.Object | fabric.Group> {
    const src = createImageSrc('icon/ic_close_s.svg');

    return new Promise(resolve => {
      fabric.loadSVGFromURL(src, (objects, options) => {
        const closeSvg = fabric.util.groupSVGElements(objects, options);

        closeSvg.hoverCursor = 'pointer';
        closeSvg.set({ stroke: 'green' });
        onCloseSvg(closeSvg, canvas, fab);
        moveCloseSvg(event, closeSvg);
        clearPool(canvas);
        canvas.add(closeSvg);
        fabricImagePool.add(closeSvg);
        resolve(closeSvg);
      });
    });
  }

  function onCloseSvg(closeSvg: fabric.Object | fabric.Group, canvas: fabric.Canvas, fab: fabric.Image | fabric.Text) {
    closeSvg.on('selected', () => {
      canvas.remove(fab);
      deleteCloseSvg(canvas, closeSvg);
    });
    // closeSvg.on('mouseover', () => {
    //   console.log({ closeSvg });
    //   canvas.renderAll();
    // });
  }

  function moveCloseSvg(event: fabric.IEvent<Event>, closeSvg: fabric.Object | fabric.Group | null) {
    const target = event.transform?.target ?? event.target;

    if (!closeSvg || !target) return;
    const { oCoords, angle, width, height } = target;

    if (oCoords === undefined || angle === undefined || width === undefined || height === undefined) return;
    const { x, y } = oCoords.tl;
    const offsetX = Math.cos(angle * (Math.PI / 180)) * ((width + 500) / 30);
    const offsetY = Math.sin(angle * (Math.PI / 180)) * ((height + 360) / 30);

    closeSvg.top = y - offsetY - 15;
    closeSvg.left = x - offsetX - 15;
  }

  function deleteCloseSvg(canvas: fabric.Canvas, closeSvg: fabric.Object | fabric.Group) {
    canvas.remove(closeSvg);
    fabricImagePool.delete(closeSvg);
  }

  function clearPool(canvas: fabric.Canvas) {
    fabricImagePool.forEach(image => deleteCloseSvg(canvas, image));
  }

  function clearActive() {
    const canvas = fabricMap.get(id);
    if (!canvas) return;
    canvas.discardActiveObject().renderAll();
  }

  function deleteCanvas() {
    const canvas = fabricMap.get(id);
    if (!canvas) return;
    canvas.clear();
    fabricMap.delete(id);
  }

  return {
    createCanvas,
    drawPDF,
    drawImage,
    specifyPage,
    renderImage,
    addFabric,
    addTextFabric,
    clearActive,
    deleteCanvas,
    pages,
  };
}
