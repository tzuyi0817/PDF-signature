import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { showToast } from '@/components/common';
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

/** 拖曳移動使用的自訂 MIME type，用於辨識首頁檔案／資料夾的拖曳 */
const DRAG_MOVE_TYPE = 'application/x-pdf-move';

/** 根目錄的放置目標 key（folderId 為 UUID，不會與此值衝突） */
const ROOT_DROP_KEY = 'drop-root';

/** 目前拖曳中的項目；dragover 階段無法讀取 dataTransfer 內容，需以模組層級狀態輔助判斷 */
const draggingPayload = ref<DragMovePayload | null>(null);

function isDragMovePayload(value: unknown): value is DragMovePayload {
  if (typeof value !== 'object' || value === null) return false;

  const { pdfIds, folderIds } = value as Record<string, unknown>;
  const isStringArray = (list: unknown) => Array.isArray(list) && list.every(item => typeof item === 'string');

  return isStringArray(pdfIds) && isStringArray(folderIds);
}

/** 優先讀取 dataTransfer 內容，失敗時退回模組層級狀態 */
function parseDropPayload(event: DragEvent): DragMovePayload | null {
  const raw = event.dataTransfer?.getData(DRAG_MOVE_TYPE);

  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);

      if (isDragMovePayload(parsed)) return parsed;
    } catch {
      // 內容非合法 JSON 時，改用模組層級狀態
    }
  }

  return draggingPayload.value;
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

function canDropPayload(payload: DragMovePayload, targetFolderId: string | null) {
  if (payload.pdfIds.length === 0 && payload.folderIds.length === 0) return false;

  // 禁止將資料夾放進自己
  if (targetFolderId !== null && payload.folderIds.includes(targetFolderId)) return false;

  // 目標與項目目前位置相同時（例如當前資料夾的麵包屑節點），不視為合法放置目標
  return !isSameLocation(payload, targetFolderId);
}

function toDropKey(targetFolderId: string | null) {
  return targetFolderId ?? ROOT_DROP_KEY;
}

/** 拖曳提示縮圖與游標的間距 */
const DRAG_PREVIEW_OFFSET = 16;

/**
 * 建立小型拖曳提示縮圖，取代瀏覽器預設的整卡截圖，
 * 避免拖曳影像過大而遮住放置目標的高亮顯示
 */
function createDragPreviewElement(preview: DragMovePreview): HTMLElement {
  const element = document.createElement('div');
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  const label = document.createElement('span');

  use.setAttribute('href', `#icon-ic_${preview.icon}`);
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

function startDragMove(event: DragEvent, payload: DragMovePayload, preview: DragMovePreview) {
  draggingPayload.value = payload;

  if (!event.dataTransfer) return;

  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData(DRAG_MOVE_TYPE, JSON.stringify(payload));

  const previewElement = createDragPreviewElement(preview);

  document.body.append(previewElement);
  event.dataTransfer.setDragImage(previewElement, DRAG_PREVIEW_OFFSET, DRAG_PREVIEW_OFFSET);
  // 瀏覽器在 dragstart 同步擷取拖曳影像，下一輪事件迴圈即可移除
  setTimeout(() => previewElement.remove(), 0);
}

/** 是否為拖曳進行中的合法放置目標（用於預先提示可放置位置） */
function isDropCandidate(targetFolderId: string | null) {
  return canDropTo(targetFolderId);
}

function canDropTo(targetFolderId: string | null) {
  if (!draggingPayload.value) return false;

  return canDropPayload(draggingPayload.value, targetFolderId);
}

function onDropTargetDragOver(event: DragEvent, targetFolderId: string | null) {
  if (!canDropTo(targetFolderId)) return;

  event.preventDefault();

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

export function useDragMove() {
  const { t } = useI18n();
  const pdfStore = usePdfStore();
  const folderStore = useFolderStore();
  /** 目前 dragover 中的放置目標 key，null 表示無 */
  const dragOverKey = ref<string | null>(null);
  /** 追蹤 dragenter / dragleave 配對次數，避免游標移入子元素時高亮閃爍 */
  let enterCount = 0;

  function isDragOverTarget(targetFolderId: string | null) {
    return dragOverKey.value === toDropKey(targetFolderId);
  }

  function endDragMove() {
    draggingPayload.value = null;
    dragOverKey.value = null;
    enterCount = 0;
  }

  function onDropTargetDragEnter(event: DragEvent, targetFolderId: string | null) {
    if (!canDropTo(targetFolderId)) return;

    event.preventDefault();

    const key = toDropKey(targetFolderId);

    if (dragOverKey.value === key) {
      enterCount += 1;
    } else {
      dragOverKey.value = key;
      enterCount = 1;
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

  async function onDropTargetDrop(event: DragEvent, targetFolderId: string | null) {
    event.preventDefault();
    dragOverKey.value = null;
    enterCount = 0;

    const payload = parseDropPayload(event);

    draggingPayload.value = null;

    if (!payload || !canDropPayload(payload, targetFolderId)) return;

    const promises: Promise<unknown>[] = [];

    if (payload.pdfIds.length > 0) {
      promises.push(pdfStore.moveFilesToFolder(new Set(payload.pdfIds), targetFolderId));
    }

    if (payload.folderIds.length > 0) {
      const result = folderStore.batchMoveFolders(new Set(payload.folderIds), targetFolderId);

      if (result) promises.push(result);
    }

    if (promises.length === 0) return;

    await Promise.all(promises);
    showToast(t('folder.moved'));
  }

  return {
    isDragOverTarget,
    isDropCandidate,
    startDragMove,
    endDragMove,
    onDropTargetDragEnter,
    onDropTargetDragOver,
    onDropTargetDragLeave,
    onDropTargetDrop,
  };
}
