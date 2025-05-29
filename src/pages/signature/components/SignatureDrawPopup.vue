<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { showToast } from '@/components/common';
import SignIcon from '@/components/SignIcon.vue';
import SignPopup from '@/components/SignPopup.vue';
import { useSignatureStore } from '@/stores';
import { isDesktop } from '@/utils/common';

const emit = defineEmits(['close']);
const canvasDraw = ref<HTMLCanvasElement | null>(null);
const currentTool = ref('black');
const isDraw = ref(false);
const { t } = useI18n();
const drawCtx = {
  ctx: null as CanvasRenderingContext2D | null | undefined,
  isPainting: false,
};

function selectTool(tool: string) {
  currentTool.value = tool;
  if (!drawCtx.ctx) return;
  drawCtx.ctx.strokeStyle = tool;
}

function addSignature() {
  const signature = canvasDraw.value?.toDataURL('image/png');
  if (!signature) return;
  useSignatureStore().addSignature(signature);
  emit('close');
  showToast(t('signature_add_success'));
}

function setCanvas() {
  if (!canvasDraw.value) return;
  if (isDesktop()) {
    canvasDraw.value.height = 235;
    canvasDraw.value.width = 466;
  } else {
    canvasDraw.value.height = window.innerHeight - 400;
  }
  drawCtx.ctx = canvasDraw.value?.getContext('2d');
  if (!drawCtx.ctx) return;
  drawCtx.ctx.lineWidth = 2;
  drawCtx.ctx.lineCap = 'round';
}

function getPaintPosition(event: MouseEvent | TouchEvent) {
  if (!canvasDraw.value) return { x: 0, y: 0 };
  const { left, top } = canvasDraw.value.getBoundingClientRect();

  if (event.type === 'mousemove') {
    const { clientX, clientY } = event as MouseEvent;
    return { x: clientX - left, y: clientY - top };
  }

  const { touches } = event as TouchEvent;

  return {
    x: touches[0].clientX - left,
    y: touches[0].clientY - top,
  };
}

function startPosition() {
  drawCtx.isPainting = true;
  drawCtx.ctx?.beginPath();
}

function finishedPosition() {
  drawCtx.isPainting = false;
  drawCtx.ctx?.closePath();
}

function draw(event: MouseEvent | TouchEvent) {
  if (!drawCtx.isPainting) return;
  const { x, y } = getPaintPosition(event);

  drawCtx.ctx?.lineTo(x, y);
  drawCtx.ctx?.stroke();
  isDraw.value = true;
}

function clear() {
  if (!canvasDraw.value) return;
  drawCtx.ctx?.clearRect(0, 0, canvasDraw.value.width, canvasDraw.value.height);
  isDraw.value = false;
}
</script>

<template>
  <sign-popup
    :title="$t('create_signature_file')"
    @child-mounted="setCanvas"
  >
    <ul class="toolbar">
      <li>
        <sign-icon
          :name="currentTool === 'black' ? 'color_black_h' : 'color_black'"
          class="w-7 h-7"
          hover-change-svg
          @click="selectTool('black')"
        />
      </li>
      <li>
        <sign-icon
          :name="currentTool === 'blue' ? 'color_blue_h' : 'color_blue'"
          class="w-7 h-7"
          hover-change-svg
          @click="selectTool('blue')"
        />
      </li>
      <li>
        <sign-icon
          :name="currentTool === 'red' ? 'color_red_h' : 'color_red'"
          class="w-7 h-7"
          hover-change-svg
          @click="selectTool('red')"
        />
      </li>
      <li>
        <sign-icon
          name="trash"
          class="w-7 h-7"
          @click="clear"
        />
      </li>
    </ul>
    <canvas
      ref="canvasDraw"
      class="bg-secondary-tint border-2 border-gray-30 rounded-[20px] mb-6"
      @mousedown.prevent="startPosition"
      @mouseup="finishedPosition"
      @mouseleave="finishedPosition"
      @mousemove="draw"
      @touchstart.prevent="startPosition"
      @touchend="finishedPosition"
      @touchcancel="finishedPosition"
      @touchmove="draw"
    ></canvas>
    <div class="flex justify-between md:justify-evenly">
      <button
        class="btn btn-base"
        @click="emit('close')"
      >
        {{ $t('cancel') }}
      </button>
      <button
        class="btn btn-primary"
        :disabled="!isDraw"
        @click="addSignature"
      >
        {{ $t('confirm') }}
      </button>
    </div>
  </sign-popup>
</template>
