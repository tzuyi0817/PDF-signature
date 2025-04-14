import type { ShallowRef } from 'vue';
import type { FabricPointerEvent } from '@component-hook/pdf-canvas/vue';
import { DRAG_MOVE_STEP } from '@/constants/common';

export function usePointerFabric(containerRef: Readonly<ShallowRef<HTMLDivElement | null>>) {
  let isPointerDown = false;
  let requestFrame: number | null = null;

  function handlePointerDown() {
    isPointerDown = true;
  }

  function cancelScrollToPerFrame() {
    if (!requestFrame) return;

    cancelAnimationFrame(requestFrame);
    requestFrame = null;
  }

  function scrollToPerFrame(offsetX: number, offsetY: number, fabric: FabricPointerEvent['target']) {
    if (!containerRef.value) return;
    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = containerRef.value;
    const top = scrollTop + offsetY;
    const left = scrollLeft + offsetX;

    if (top < 0 || left < 0 || top + clientHeight > scrollHeight || left + clientWidth > scrollWidth) {
      cancelScrollToPerFrame();
      return;
    }

    requestFrame = requestAnimationFrame(() => {
      containerRef.value?.scrollTo({ top, left });
      updateFabricCoords(offsetX, offsetY, fabric);
      scrollToPerFrame(offsetX, offsetY, fabric);
    });
  }

  function handlePointerMove(event: FabricPointerEvent) {
    if (!isPointerDown || !containerRef.value) return;
    const { clientX, clientY } = event.e instanceof TouchEvent ? event.e.touches[0] : event.e;
    const isAtEdge = isPointerAtViewportEdge(clientX, clientY, event.transform);
    let offsetX = 0;
    let offsetY = 0;

    cancelScrollToPerFrame();

    if (isAtEdge?.left || isAtEdge?.right) {
      offsetX = (isAtEdge.left ? -1 : 1) * DRAG_MOVE_STEP;
    }

    if (isAtEdge?.top || isAtEdge?.bottom) {
      offsetY = (isAtEdge.top ? -1 : 1) * DRAG_MOVE_STEP;
    }

    if (!offsetX && !offsetY) return;

    requestFrame = window.requestAnimationFrame(() => {
      scrollToPerFrame(offsetX, offsetY, event.target);
    });
  }

  function isPointerAtViewportEdge(clientX: number, clientY: number, transform: FabricPointerEvent['transform']) {
    if (!containerRef.value) return null;
    const rect = containerRef.value.getBoundingClientRect();
    const { height = 0, width = 0, offsetX = 0, offsetY = 0, scaleX = 0, scaleY = 0, target } = transform ?? {};
    const edgeThreshold = 20;
    const borderScaleFactor = target ? target.borderScaleFactor : 1;
    const originalWidth = width * scaleX;
    const originalHeight = height * scaleY;
    const offsetTop = offsetY / borderScaleFactor || edgeThreshold;
    const offsetBottom = (originalHeight - offsetY) / borderScaleFactor || edgeThreshold;
    const offsetLeft = offsetX / borderScaleFactor || edgeThreshold;
    const offsetRight = (originalWidth - offsetX) / borderScaleFactor || edgeThreshold;
    const top = clientY <= rect.top + offsetTop;
    const bottom = clientY >= rect.bottom - offsetBottom;
    const left = clientX <= rect.left + offsetLeft;
    const right = clientX >= rect.right - offsetRight;

    return { top, bottom, left, right };
  }

  function handlePointerUp() {
    cancelScrollToPerFrame();
    isPointerDown = false;
  }

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}

function updateFabricCoords(offsetX: number, offsetY: number, fabric: FabricPointerEvent['target']) {
  if (!fabric) return;

  fabric.left += offsetX * fabric.borderScaleFactor;
  fabric.top += offsetY * fabric.borderScaleFactor;
  fabric.setCoords();
  fabric.canvas?.renderAll();
}
