<script setup lang="ts">
import { computed, nextTick, onMounted, onScopeDispose, ref, useTemplateRef, watch } from 'vue';
import { DURATION, SPACE_Y, Z_INDEX } from './constants';
import { getPreviousToast } from './toast';
import type { ToastType } from './types';

interface Props {
  message?: string;
  duration?: number;
  id: string;
  zIndex?: number;
  type?: ToastType;
}

interface Emits {
  close: [];
  closed: [];
  mounted: [height: number];
}

defineOptions({ name: 'Toast' });

const props = withDefaults(defineProps<Props>(), {
  message: '',
  duration: DURATION,
  zIndex: Z_INDEX,
  type: 'success',
});
const emits = defineEmits<Emits>();
const isShow = ref(false);
const height = ref(0);
const isClose = ref(false);
const toastRef = useTemplateRef('toastRef');
let observer: ResizeObserver | null = new ResizeObserver(updateHeight);
let timer: NodeJS.Timeout | null = null;

const offsetY = computed(() => {
  const previousToast = getPreviousToast(props.id);

  if (!previousToast) return 0;
  const { component } = previousToast;

  return (component.exposed?.offsetBottom?.value ?? 0) + SPACE_Y;
});

const offsetBottom = computed(() => offsetY.value + height.value);

const translateY = computed(() => `${offsetY.value}px`);

const transitionName = computed(() => {
  if (isClose.value) return 'fade-leave-to';

  return isShow.value ? 'fade-enter-to' : 'fade-enter-from';
});

function startTiming() {
  if (props.duration === 0) return;

  timer = setTimeout(() => {
    close();
  }, props.duration);
}

function close() {
  isClose.value = true;
  emits('close');

  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function onTransitionEnd() {
  if (!isClose.value) return;

  emits('closed');
}

function updateHeight() {
  if (!toastRef.value) return;

  height.value = toastRef.value.offsetHeight;
}

watch(toastRef, (element, oldElement) => {
  if (oldElement) {
    observer?.unobserve(oldElement);
  }

  if (element) {
    observer?.observe(element);
  }
});

onMounted(async () => {
  if (!toastRef.value) return;
  await nextTick();
  emits('mounted', toastRef.value.getBoundingClientRect().height);

  await nextTick();
  startTiming();
  isShow.value = true;
});

onScopeDispose(() => {
  if (!observer) return;

  observer.disconnect();
  observer = null;
});

defineExpose({ close, offsetBottom });
</script>

<template>
  <div
    ref="toastRef"
    :class="['toast', type, transitionName]"
    :data-id="id"
    role="alert"
    @transitionend="onTransitionEnd"
  >
    <p class="highlight text-white truncate w-fit">
      {{ message }}
    </p>

    <img
      src="@/assets/icon/ic_close_s_white.svg"
      class="cursor-pointer w-10 h-10"
      alt="close toast icon"
      @click="close"
    />
  </div>
</template>

<style lang="css" scoped>
.toast {
  z-index: v-bind(zIndex);
  position: fixed;
  left: 50%;
  top: 20px;
  transform: translate(-50%, v-bind(translateY));
  transition-property: opacity, transform;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 8px;
  width: fit-content;
  max-width: 90%;
  height: 40px;
  border: 2px solid;
  border-radius: 50px;
}

.toast.success {
  background-color: --alpha(var(--color-primary-dark) / 0.9);
  border-color: var(--color-primary);
}

.toast.error {
  background-color: --alpha(var(--color-danger) / 0.9);
  border-color: #ffad99;
}

.toast.warn {
  background-color: --alpha(#cc8800 / 0.9);
  border-color: #ff9980;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-100% + v-bind(translateY)));
}

@media (min-width: 768px) {
  .toast {
    padding: 24px 12px 24px 24px;
  }
}
</style>
