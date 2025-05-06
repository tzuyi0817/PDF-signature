import { createVNode, render, shallowReactive, type ComponentInternalInstance } from 'vue';
import Toast from './index.vue';
import type { ToastContext, ToastParams } from './types';

const toasts = shallowReactive<ToastContext[]>([]);
let toastKey = 0;

function createToast(params: ToastParams) {
  const id = `toast-${++toastKey}`;
  const options = typeof params === 'string' ? { message: params } : params;
  let container: HTMLElement | null = document.createElement('div');
  const props = {
    ...options,
    id,
    onClose: () => {
      // removeCloseAllEventListener()
    },
    onClosed: () => {
      if (container) {
        render(null, container);
      }

      container = null;
      clearToast(id);
      options.onClosed?.();
    },
    onMounted: () => {
      // addCloseAllEventListener()
    },
  };
  const toast = createVNode(Toast, props);

  render(toast, container);

  if (container.firstElementChild) {
    const appendContainer = document.body;

    appendContainer.append(container.firstElementChild);
  }
  const component = toast.component as ComponentInternalInstance;
  const handleClose: ToastContext['close'] = component.exposed?.close ?? (() => {});

  return { id, component, close: handleClose };
}

export function showToast(params: ToastParams) {
  const toastContext = createToast(params);

  toasts.push(toastContext);

  return {
    close: toastContext.close,
  };
}

function clearToast(id: string) {
  const index = toasts.findIndex(item => item.id === id);

  if (index === -1) return;

  toasts.splice(index, 1);
}

export function closeAllToast() {
  for (const item of toasts) {
    item.close();
  }
}

export function getPreviousToast(id: string) {
  const index = toasts.findIndex(item => item.id === id);

  if (index <= 0) return null;

  return toasts[index - 1];
}

// function addCloseAllEventListener() {
//   if (toasts.length > 1) return

//   setTimeout(() => {
//     document.addEventListener('click', closeAllToast)
//   })
// }

// function removeCloseAllEventListener() {
//   if (toasts.length > 0) return

//   document.removeEventListener('click', closeAllToast)
// }
