import { fabric } from 'fabric';
import { printPDF } from '@/utils/pdfJs';

const fabricMap = new Map();

export default function useFabric(id: string) {
  function createCanvas() {
    if (fabricMap.has(id)) return;
    fabricMap.set(id, new fabric.Canvas(id));
  }

  async function drawPDF(file: File) {
    const canvas = fabricMap.get(id);
    canvas.requestRenderAll();
    const pdfData = await printPDF(file);
    if (!pdfData) return;
    const pdfImage = pdfToImage(pdfData);

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
  }
}