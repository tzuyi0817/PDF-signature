/**
 * Spike #135 區塊 4：量 complete 頁預覽的渲染時間。
 *
 * 用網址參數切換策略：
 * - ?strategy=png        現況：每頁一張整頁 PNG，用 <img> 顯示
 * - ?strategy=pdfjs      新做法 A：原始 PDF 只載入一次，逐頁用 pdf.js 畫到 canvas，overlay 用 <img> 疊上
 * - ?strategy=pdf-canvas 新做法 B：每頁掛一個 pdf-canvas 元件（app 現有的渲染方式），overlay 用 <img> 疊上
 * - ?src=/路徑.pdf        換成自己的文件
 */
import PdfCanvas from '@component-hook/pdf-canvas/vue';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { createApp, h } from 'vue';

GlobalWorkerOptions.workerSrc = workerUrl;

type Strategy = 'png' | 'pdfjs' | 'pdf-canvas';

interface Timing {
  /** 第一頁出現在畫面上的時間（ms，從開始顯示算起） */
  firstPage: number;
  /** 全部頁面完成的時間 */
  allPages: number;
  /** 單頁最慢的渲染時間 */
  slowestPage: number;
  /** 所有 canvas 佔用的像素記憶體（MB），<img> 策略為 0 */
  canvasMemory: number;
}

export type PreviewResult = (Timing & { strategy: Strategy; pages: number; pixelWidth: number }) | { error: string };

const params = new URLSearchParams(location.search);
const SOURCE_URL = params.get('src') ?? '/spike/pdf-lib/out/preview-20.pdf';
/** 預覽區 CSS 寬度上限 842px；像素密度超過 2 的裝置不再加倍，避免 canvas 過大 */
const PIXEL_WIDTH = Math.round(Math.min(window.innerWidth - 24, 818) * Math.min(window.devicePixelRatio, 2));
/** 現況整頁 PNG 的像素密度：簽署頁 fileScale 6.8 × (96 / 72) ÷ 3 */
const CURRENT_PNG_PIXELS_PER_POINT = (6.8 * (96 / 72)) / 3;
/** overlay 在頁面上的位置（0–1 比例），模擬右下角的簽名 */
const OVERLAY_BOX = { x: 0.55, y: 0.8, width: 0.3, height: 0.08 };
const BYTES_PER_PIXEL = 4;

const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

function isStrategy(value: string | null): value is Strategy {
  return value === 'png' || value === 'pdfjs' || value === 'pdf-canvas';
}

function toBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Failed to export canvas'))), 'image/png');
  });
}

async function createOverlayUrl() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = 480;
  canvas.height = 160;

  if (context) {
    context.strokeStyle = '#1f4ed8';
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(20, 120);
    context.bezierCurveTo(120, 10, 200, 150, 460, 40);
    context.stroke();
  }

  return URL.createObjectURL(await toBlob(canvas));
}

function createPageElement(stage: HTMLElement) {
  const element = document.createElement('div');

  element.className = 'page';
  stage.append(element);

  return element;
}

function appendOverlay(pageElement: HTMLElement, overlayUrl: string) {
  const image = document.createElement('img');

  image.className = 'overlay';
  image.src = overlayUrl;
  image.style.left = `${OVERLAY_BOX.x * 100}%`;
  image.style.top = `${OVERLAY_BOX.y * 100}%`;
  image.style.width = `${OVERLAY_BOX.width * 100}%`;
  image.style.height = `${OVERLAY_BOX.height * 100}%`;
  pageElement.append(image);
}

async function renderPage(doc: PDFDocumentProxy, pageNumber: number, pixelsPerPoint?: number) {
  const page = await doc.getPage(pageNumber);
  const baseWidth = page.getViewport({ scale: 1 }).width;
  const viewport = page.getViewport({ scale: pixelsPerPoint ?? PIXEL_WIDTH / baseWidth });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Failed to get 2d context');

  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  await page.render({ canvasContext: context, viewport }).promise;

  return canvas;
}

function summarize(start: number, marks: number[], canvases: HTMLCanvasElement[]): Timing {
  const durations = marks.map((mark, index) => mark - (marks[index - 1] ?? start));
  const pixels = canvases.reduce((total, canvas) => total + canvas.width * canvas.height, 0);

  return {
    firstPage: (marks[0] ?? start) - start,
    allPages: (marks.at(-1) ?? start) - start,
    slowestPage: Math.max(0, ...durations),
    canvasMemory: (pixels * BYTES_PER_PIXEL) / 1024 / 1024,
  };
}

/** 現況：先（不計時）產生每頁的整頁 PNG，再計時把它們用 <img> 顯示出來 */
async function showPngPages(stage: HTMLElement, source: Uint8Array): Promise<Timing & { pages: number }> {
  const doc = await getDocument({ data: new Uint8Array(source) }).promise;
  const urls: string[] = [];

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const canvas = await renderPage(doc, pageNumber, CURRENT_PNG_PIXELS_PER_POINT);

    urls.push(URL.createObjectURL(await toBlob(canvas)));
  }

  await doc.destroy();
  await nextFrame();

  const start = performance.now();
  const marks = await Promise.all(
    urls.map(async url => {
      const image = document.createElement('img');

      image.className = 'full';
      image.src = url;
      createPageElement(stage).append(image);
      await image.decode();

      return performance.now();
    }),
  );

  return {
    ...summarize(
      start,
      marks.toSorted((a, b) => a - b),
      [],
    ),
    pages: urls.length,
  };
}

/** 新做法 A：文件只載入一次，逐頁畫到 canvas */
async function showWithPdfJs(stage: HTMLElement, source: Uint8Array, overlayUrl: string) {
  const start = performance.now();
  const doc = await getDocument({ data: new Uint8Array(source) }).promise;
  const marks: number[] = [];
  const canvases: HTMLCanvasElement[] = [];

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const pageElement = createPageElement(stage);
    const canvas = await renderPage(doc, pageNumber);

    pageElement.append(canvas);
    appendOverlay(pageElement, overlayUrl);
    canvases.push(canvas);
    marks.push(performance.now());
  }

  const pages = doc.numPages;

  await doc.destroy();

  return { ...summarize(start, marks, canvases), pages };
}

/** 新做法 B：每頁掛一個 pdf-canvas 元件，一頁載完再掛下一頁（與簽署頁相同的節奏） */
async function showWithPdfCanvas(stage: HTMLElement, source: Uint8Array, overlayUrl: string) {
  const file = new File([new Uint8Array(source)], 'preview.pdf', { type: 'application/pdf' });
  const probe = await getDocument({ data: new Uint8Array(source) }).promise;
  const pages = probe.numPages;
  const firstPage = await probe.getPage(1);
  const baseWidth = firstPage.getViewport({ scale: 1 }).width;
  /** pdf-canvas 的畫布像素寬 = 頁寬 × fileScale × (96 / 72) ÷ 3，反推出目標寬度需要的 fileScale */
  const fileScale = (PIXEL_WIDTH * 3) / (baseWidth * (96 / 72));

  await probe.destroy();

  const start = performance.now();
  const marks: number[] = [];
  const canvases: HTMLCanvasElement[] = [];

  for (let page = 1; page <= pages; page++) {
    const pageElement = createPageElement(stage);
    const { promise: loaded, resolve: resolveLoaded } = Promise.withResolvers<void>();

    createApp({
      render: () =>
        h(PdfCanvas, {
          file: { PDFId: 'preview', name: 'preview', updateDate: 0, pages, data: file },
          page,
          fileScale,
          canvasId: 'preview-canvas',
          manualReload: true,
          onLoaded: resolveLoaded,
        }),
    }).mount(pageElement);

    await loaded;
    appendOverlay(pageElement, overlayUrl);
    canvases.push(...pageElement.querySelectorAll('canvas'));
    marks.push(performance.now());
  }

  return { ...summarize(start, marks, canvases), pages };
}

async function run(): Promise<PreviewResult> {
  const stage = document.querySelector<HTMLElement>('#stage');

  if (!stage) throw new Error('Stage element is missing');

  const strategyParam = params.get('strategy');
  const strategy = isStrategy(strategyParam) ? strategyParam : 'pdfjs';
  const response = await fetch(SOURCE_URL);
  const source = new Uint8Array(await response.arrayBuffer());
  const overlayUrl = await createOverlayUrl();
  const runners = {
    png: () => showPngPages(stage, source),
    pdfjs: () => showWithPdfJs(stage, source, overlayUrl),
    'pdf-canvas': () => showWithPdfCanvas(stage, source, overlayUrl),
  };
  const timing = await runners[strategy]();

  await nextFrame();

  return { ...timing, strategy, pixelWidth: PIXEL_WIDTH };
}

function publish(result: PreviewResult) {
  const element = document.createElement('script');
  const report = document.querySelector('#report');

  element.id = 'spike-result';
  element.type = 'application/json';
  element.textContent = JSON.stringify(result);
  document.body.append(element);

  if (report) {
    report.textContent =
      'error' in result
        ? result.error
        : `${result.strategy}：首頁 ${result.firstPage.toFixed(0)} ms，${result.pages} 頁共 ${result.allPages.toFixed(0)} ms，最慢單頁 ${result.slowestPage.toFixed(0)} ms，canvas ${result.canvasMemory.toFixed(0)} MB`;
  }
}

try {
  publish(await run());
} catch (error) {
  publish({ error: error instanceof Error ? (error.stack ?? error.message) : String(error) });
}
