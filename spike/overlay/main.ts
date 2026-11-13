/**
 * Spike #135 區塊 3：在瀏覽器內量 overlay 對位誤差。
 *
 * 每頁流程：用 pdf-canvas 渲染 → 放洋紅色標記 → 從畫面 canvas 量標記位置（基準）
 * → exportOverlay → pdf-lib 疊回原始 PDF → 用 pdf.js 重新渲染輸出 → 再量一次 → 比較四個邊。
 */
import PdfCanvas from '@component-hook/pdf-canvas/vue';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { createApp, h, ref } from 'vue';
import { overlayOnOriginal, type PageOverlay } from './place-overlay.ts';

GlobalWorkerOptions.workerSrc = workerUrl;

type PdfCanvasInstance = InstanceType<typeof PdfCanvas>;

/** 標記外框，單位 pt，原點在畫面左上 */
interface Edges {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Marker {
  /** 位置：頁面寬高的比例 */
  fx: number;
  fy: number;
  scale: number;
  angle: number;
}

interface Row {
  page: number;
  viewSize: string;
  screen: Edges;
  output: Edges;
  overlayPx: string;
  maxError: number;
}

/** 與 app 簽署頁相同的渲染倍率 */
const FILE_SCALE = 6.8;
const EXPORT_MULTIPLIER = 2;
const OUTPUT_RENDER_SCALE = 4;
const SOURCE_URL = '/spike/pdf-lib/out/source.pdf';
/** 每頁的標記：涵蓋單一／多個物件、縮放、旋轉、靠近角落 */
const MARKERS: Marker[][] = [
  [
    { fx: 0.2, fy: 0.15, scale: 1, angle: 0 },
    { fx: 0.6, fy: 0.7, scale: 0.6, angle: 0 },
  ],
  [{ fx: 0.7, fy: 0.2, scale: 1, angle: 0 }],
  [{ fx: 0.3, fy: 0.6, scale: 1.4, angle: 15 }],
  [{ fx: 0.15, fy: 0.25, scale: 1, angle: 0 }],
  [{ fx: 0.55, fy: 0.75, scale: 0.8, angle: 30 }],
  [{ fx: 0.65, fy: 0.1, scale: 1, angle: 0 }],
  [{ fx: 0.05, fy: 0.8, scale: 1, angle: 0 }],
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

function createMarkerUrl() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = 120;
  canvas.height = 60;

  if (context) {
    context.fillStyle = '#ff00ff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  return canvas.toDataURL('image/png');
}

/** 掃描 canvas 上的洋紅色像素，回傳外框佔整張 canvas 的比例 */
function findMarkerBox(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) throw new Error('Failed to get 2d context');

  const { width, height } = canvas;
  const { data } = context.getImageData(0, 0, width, height);
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const isMagenta = (data[offset] ?? 0) > 180 && (data[offset + 1] ?? 255) < 100 && (data[offset + 2] ?? 0) > 180;

      if (!isMagenta) continue;

      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < 0) throw new Error('Marker not found on canvas');

  return {
    left: left / width,
    top: top / height,
    right: (right + 1) / width,
    bottom: (bottom + 1) / height,
  };
}

function toEdges(box: ReturnType<typeof findMarkerBox>, viewWidth: number, viewHeight: number): Edges {
  return {
    left: box.left * viewWidth,
    top: box.top * viewHeight,
    right: box.right * viewWidth,
    bottom: box.bottom * viewHeight,
  };
}

/** 用 pdf-canvas 渲染一頁、放上標記，回傳畫面上的標記位置與匯出的 overlay */
async function signPage(stage: HTMLElement, file: File, pages: number, page: number, markers: Marker[]) {
  const instance = ref<PdfCanvasInstance | null>(null);
  const container = document.createElement('div');
  const { promise: loaded, resolve: resolveLoaded } = Promise.withResolvers<void>();
  const app = createApp({
    render: () =>
      h(PdfCanvas, {
        ref: instance,
        file: { PDFId: 'spike', name: 'spike', updateDate: 0, pages, data: file },
        page,
        fileScale: FILE_SCALE,
        canvasId: 'spike-canvas',
        manualReload: true,
        closeSvgOptions: { src: '' },
        onLoaded: resolveLoaded,
      }),
  });

  stage.append(container);
  app.mount(container);
  await loaded;
  await sleep(200);

  const canvasItem = instance.value;
  const canvas = canvasItem?.canvasRef;

  if (!canvasItem || !canvas) throw new Error(`Canvas for page ${page} is not ready`);

  const pageWidth = canvas.getBoundingClientRect().width;
  const pageHeight = canvas.getBoundingClientRect().height;
  const markerUrl = createMarkerUrl();

  for (const { fx, fy, scale, angle } of markers) {
    canvasItem.addImage(markerUrl, { left: fx * pageWidth, top: fy * pageHeight, scaleX: scale, scaleY: scale, angle });
  }

  await sleep(400);
  canvasItem.clearActive();
  await nextFrame();
  await nextFrame();

  const screenBox = findMarkerBox(canvas);
  const overlay = await canvasItem.exportOverlay({ multiplier: EXPORT_MULTIPLIER });

  if (!overlay) throw new Error(`No overlay exported for page ${page}`);

  const bitmap = await createImageBitmap(overlay.blob);
  const overlayPx = `${bitmap.width}×${bitmap.height}`;
  const { blob, ...box } = overlay;
  const pageOverlay: PageOverlay = { page, png: new Uint8Array(await blob.arrayBuffer()), ...box };

  bitmap.close();
  app.unmount();
  container.remove();

  return { screenBox, pageOverlay, overlayPx };
}

/** 用 pdf.js 渲染輸出 PDF 的每一頁，量標記位置 */
async function measureOutput(bytes: Uint8Array) {
  const doc = await getDocument({ data: new Uint8Array(bytes) }).promise;
  const results: { viewWidth: number; viewHeight: number; box: ReturnType<typeof findMarkerBox> }[] = [];

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: OUTPUT_RENDER_SCALE });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) throw new Error('Failed to get 2d context');

    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvasContext: context, viewport }).promise;

    results.push({
      viewWidth: viewport.width / OUTPUT_RENDER_SCALE,
      viewHeight: viewport.height / OUTPUT_RENDER_SCALE,
      box: findMarkerBox(canvas),
    });
  }

  await doc.destroy();

  return results;
}

function renderReport(rows: Row[]) {
  const report = document.querySelector('#report');

  if (!report) return;

  const table = document.createElement('table');
  const format = (edges: Edges) =>
    Object.values(edges)
      .map(value => value.toFixed(2))
      .join(' / ');

  table.innerHTML =
    '<tr><th>頁</th><th>可視尺寸 pt</th><th>畫面 L/T/R/B</th><th>輸出 L/T/R/B</th><th>最大誤差 pt</th></tr>';

  for (const row of rows) {
    const tr = document.createElement('tr');

    for (const text of [
      String(row.page),
      row.viewSize,
      format(row.screen),
      format(row.output),
      row.maxError.toFixed(3),
    ]) {
      const td = document.createElement('td');

      td.textContent = text;
      tr.append(td);
    }

    table.append(tr);
  }

  report.replaceChildren(table);
}

async function run() {
  const stage = document.querySelector<HTMLElement>('#stage');

  if (!stage) throw new Error('Stage element is missing');

  const response = await fetch(SOURCE_URL);
  const source = new Uint8Array(await response.arrayBuffer());
  const file = new File([source], 'source.pdf', { type: 'application/pdf' });
  const signed: Awaited<ReturnType<typeof signPage>>[] = [];

  for (const [index, markers] of MARKERS.entries()) {
    signed.push(await signPage(stage, file, MARKERS.length, index + 1, markers));
  }

  const output = await overlayOnOriginal(
    source,
    signed.map(({ pageOverlay }) => pageOverlay),
  );
  const measured = await measureOutput(output);
  const rows = signed.flatMap(({ screenBox, overlayPx }, index): Row[] => {
    const result = measured[index];

    if (!result) return [];

    const screen = toEdges(screenBox, result.viewWidth, result.viewHeight);
    const outputEdges = toEdges(result.box, result.viewWidth, result.viewHeight);
    const maxError = Math.max(
      Math.abs(screen.left - outputEdges.left),
      Math.abs(screen.top - outputEdges.top),
      Math.abs(screen.right - outputEdges.right),
      Math.abs(screen.bottom - outputEdges.bottom),
    );

    return [
      {
        page: index + 1,
        viewSize: `${result.viewWidth.toFixed(1)}×${result.viewHeight.toFixed(1)}`,
        screen,
        output: outputEdges,
        overlayPx,
        maxError,
      },
    ];
  });

  renderReport(rows);

  return { rows, devicePixelRatio: window.devicePixelRatio, pdf: Array.from(output) };
}

export type SpikeResult = Awaited<ReturnType<typeof run>> | { error: string };

/** 把結果寫進 DOM，讓 Playwright 腳本讀取 */
function publish(result: SpikeResult) {
  const element = document.createElement('script');

  element.id = 'spike-result';
  element.type = 'application/json';
  element.textContent = JSON.stringify(result);
  document.body.append(element);
}

try {
  publish(await run());
} catch (error) {
  publish({ error: error instanceof Error ? (error.stack ?? error.message) : String(error) });
}
