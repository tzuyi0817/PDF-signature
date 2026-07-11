import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { showToast, toSvgSymbolId } from '@/components/common';
import { useFolderStore, usePdfStore } from '@/stores';

export interface DragMovePayload {
  /** 拖曳中的檔案 ID 陣列 */
  pdfIds: string[];
  /** 拖曳中的資料夾 ID 陣列 */
  folderIds: string[];
}

export interface DragMovePreview {
  /** 拖曳提示縮圖的標籤文字（通常為項目名稱） */
  label: string;
  /** 拖曳提示縮圖使用的 sprite 圖示名稱 */
  icon: 'folder' | 'file_item';
}

/** 拖曳移動使用的自訂 MIME type；Firefox 需要 dataTransfer 帶有資料才會啟動拖曳 */
const DRAG_MOVE_TYPE = 'application/x-pdf-move';
/** 根目錄的放置目標 key（folderId 為 UUID，不會與此值衝突） */
const ROOT_DROP_KEY = 'drop-root';
/** 拖曳提示縮圖與游標的間距 */
const DRAG_PREVIEW_OFFSET = 16;
/**
 * 目前拖曳中的項目；dragover 階段無法讀取 dataTransfer 內容，
 * 且全 app 同時僅有一個拖曳 session，故以模組層級狀態判斷
 */
const draggingPayload = ref<DragMovePayload | null>(null);
/** 目前 dragover 中的放置目標 key，null 表示無；游標同時只會位於一個放置目標上 */
const dragOverKey = ref<string | null>(null);
/** 放置目標合法性快取；payload 與清單在拖曳期間不變，每個目標整趟拖曳只需計算一次 */
const dropCandidateCache = new Map<string, boolean>();
/** 拖曳來源的 id 集合 */
let dragSourceIds = new Set<string>();
/** 拖曳移動成功後的回呼，由發起拖曳的元件註冊（例如清除批次選取） */
let onMovedCallback: (() => void) | null = null;
/** 追蹤 dragenter / dragleave 配對次數，避免游標移入子元素時高亮閃爍 */
let enterCount = 0;

function toDropKey(targetFolderId: string | null) {
  return targetFolderId ?? ROOT_DROP_KEY;
}

/** 判斷所有拖曳項目是否已位於目標資料夾（移動到原位置視為無效放置） */
function isSameLocation(payload: DragMovePayload, targetFolderId: string | null) {
  const { PDFList } = usePdfStore();
  const { getFolderById } = useFolderStore();
  const targetId = targetFolderId ?? undefined;

  const isFileInTarget = (id: string) => {
    const pdf = PDFList.find(({ PDFId }) => PDFId === id);

    return !pdf || pdf.folderId === targetId;
  };
  const isFolderInTarget = (id: string) => {
    const folder = getFolderById(id);

    return !folder || folder.parentId === targetFolderId;
  };

  return payload.pdfIds.every(isFileInTarget) && payload.folderIds.every(isFolderInTarget);
}

function computeCanDrop(payload: DragMovePayload, targetFolderId: string | null) {
  // 禁止將資料夾放進自己
  if (targetFolderId !== null && payload.folderIds.includes(targetFolderId)) return false;

  // 目標與項目目前位置相同時（例如當前資料夾的麵包屑節點），不視為合法放置目標
  return !isSameLocation(payload, targetFolderId);
}

/** 是否為拖曳進行中的合法放置目標（用於預先提示可放置位置；dragover 高頻觸發，故以快取避免重複掃描清單） */
function isDropCandidate(targetFolderId: string | null) {
  const payload = draggingPayload.value;

  if (!payload) return false;

  const key = toDropKey(targetFolderId);
  const cached = dropCandidateCache.get(key);

  if (cached !== undefined) return cached;

  const canDrop = computeCanDrop(payload, targetFolderId);

  dropCandidateCache.set(key, canDrop);

  return canDrop;
}

/** 項目是否包含在拖曳中的 payload 內（用於呈現所有拖曳來源的視覺狀態） */
function isDragSourceItem(id: string) {
  return draggingPayload.value !== null && dragSourceIds.has(id);
}

function isDragOverTarget(targetFolderId: string | null) {
  return dragOverKey.value === toDropKey(targetFolderId);
}

function endDragMove() {
  draggingPayload.value = null;
  dragSourceIds = new Set();
  onMovedCallback = null;
  dragOverKey.value = null;
  enterCount = 0;
  dropCandidateCache.clear();
}

/**
 * 建立小型拖曳提示縮圖，取代瀏覽器預設的整卡截圖，
 * 避免拖曳影像過大而遮住放置目標的高亮顯示
 */
function createDragPreviewElement(preview: DragMovePreview): HTMLElement {
  const element = document.createElement('div');
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  const label = document.createElement('span');

  use.setAttribute('href', toSvgSymbolId(preview.icon));
  icon.append(use);
  icon.setAttribute('width', '20');
  icon.setAttribute('height', '20');
  icon.style.cssText = 'flex-shrink: 0; color: var(--color-primary); fill: currentColor;';

  label.textContent = preview.label;
  label.style.cssText = 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';

  element.append(icon, label);
  element.style.cssText = [
    'position: absolute',
    'top: -9999px',
    'left: -9999px',
    'display: flex',
    'align-items: center',
    'gap: 8px',
    'max-width: 240px',
    'padding: 8px 16px',
    'border: 2px solid var(--color-primary)',
    'border-radius: 9999px',
    'background-color: var(--color-card-bg)',
    'box-shadow: 0 2px 8px rgb(0 0 0 / 0.2)',
    'font-size: 14px',
    'pointer-events: none',
  ].join('; ');

  return element;
}

function startDragMove(event: DragEvent, payload: DragMovePayload, preview: DragMovePreview, onMoved?: () => void) {
  draggingPayload.value = payload;
  dragSourceIds = new Set([...payload.pdfIds, ...payload.folderIds]);
  onMovedCallback = onMoved ?? null;
  dropCandidateCache.clear();

  if (!event.dataTransfer) return;

  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData(DRAG_MOVE_TYPE, JSON.stringify(payload));

  const previewElement = createDragPreviewElement(preview);

  document.body.append(previewElement);
  event.dataTransfer.setDragImage(previewElement, DRAG_PREVIEW_OFFSET, DRAG_PREVIEW_OFFSET);
  // 瀏覽器在 dragstart 同步擷取拖曳影像，下一輪事件迴圈即可移除
  setTimeout(() => previewElement.remove(), 0);
}

function onDropTargetDragEnter(event: DragEvent, targetFolderId: string | null) {
  if (!isDropCandidate(targetFolderId)) return;

  event.preventDefault();

  const key = toDropKey(targetFolderId);

  if (dragOverKey.value === key) {
    enterCount += 1;
  } else {
    dragOverKey.value = key;
    enterCount = 1;
  }
}

function onDropTargetDragOver(event: DragEvent, targetFolderId: string | null) {
  if (!isDropCandidate(targetFolderId)) return;

  event.preventDefault();

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function onDropTargetDragLeave(targetFolderId: string | null) {
  if (dragOverKey.value !== toDropKey(targetFolderId)) return;

  enterCount -= 1;

  if (enterCount <= 0) {
    dragOverKey.value = null;
    enterCount = 0;
  }
}

export function useDragMove() {
  const { t } = useI18n();

  async function onDropTargetDrop(event: DragEvent, targetFolderId: string | null) {
    event.preventDefault();

    const payload = draggingPayload.value;
    const onMoved = onMovedCallback;
    const isValidDrop = isDropCandidate(targetFolderId);

    // 拖曳來源可能因移動而自 DOM 移除、不再收到 dragend，故 drop 時一併清理拖曳狀態
    endDragMove();

    if (!payload || !isValidDrop) return;

    const promises: Promise<unknown>[] = [];

    if (payload.pdfIds.length > 0) {
      promises.push(usePdfStore().moveFilesToFolder(new Set(payload.pdfIds), targetFolderId));
    }

    if (payload.folderIds.length > 0) {
      const result = useFolderStore().batchMoveFolders(new Set(payload.folderIds), targetFolderId);

      if (result) promises.push(result);
    }

    if (promises.length === 0) return;

    await Promise.all(promises);
    showToast(t('folder.moved'));
    onMoved?.();
  }

  return {
    isDragOverTarget,
    isDropCandidate,
    isDragSourceItem,
    startDragMove,
    endDragMove,
    onDropTargetDragEnter,
    onDropTargetDragOver,
    onDropTargetDragLeave,
    onDropTargetDrop,
  };
}
