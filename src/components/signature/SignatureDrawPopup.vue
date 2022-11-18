<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import { useSignatureStore } from '@/store';
import SignIcon from '@/components/SignIcon.vue';
import toast from '@/utils/toast';

const emit = defineEmits(['close']);
const canvasDraw = ref<HTMLCanvasElement | null>(null);
const currentTool = ref('black');
const isDraw = ref(false);
const SignPopup = defineAsyncComponent(() => import('@/components/SignPopup.vue'));
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
  toast.showToast('簽名檔新增成功', 'success');
}

function setCanvas() {
  drawCtx.ctx = canvasDraw.value?.getContext('2d');
  if (!drawCtx.ctx) return;
  drawCtx.ctx.lineWidth = 4;
  drawCtx.ctx.lineCap = 'round';
}

function getPaintPosition(event: MouseEvent | TouchEvent) {
  if (!canvasDraw.value) return { x: 0, y: 0 };
  const { left, top } = canvasDraw.value.getBoundingClientRect();

  if (event.type === 'mousemove') {
    const { clientX, clientY } = event as MouseEvent;
    return { x: clientX - left , y: clientY - top };
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
  <sign-popup title="建立簽名檔" @childMounted="setCanvas">
    <ul class="toolbar">
      <li>
        <sign-icon
          icon="color_black"
          @click="selectTool('black')"
          :isActive="currentTool === 'black'"
        />
      </li>
      <li>
        <sign-icon
          icon="color_blue"
          @click="selectTool('blue')"
          :isActive="currentTool === 'blue'"
        />
      </li>
      <li>
        <sign-icon
          icon="color_red"
          @click="selectTool('red')"
          :isActive="currentTool === 'red'"
        />
      </li>
      <li>
        <sign-icon icon="trash" @click="clear" />
      </li>
    </ul>
    <canvas
      ref="canvasDraw"
      class="w-full h-[40vh] bg-secondary-tint border-2 border-gray-30 rounded-[20px] mb-6"
      width="500"
      height="300"
      @mousedown.prevent="startPosition"
      @mouseup="finishedPosition"
      @mouseleave="finishedPosition"
      @mousemove="draw"
      @touchstart.prevent="startPosition"
      @touchend="finishedPosition"
      @touchcancel="finishedPosition"
      @touchmove="draw"
    ></canvas>
    <div class="flex justify-between">
      <button class="btn btn_base" @click="emit('close')">取消</button>
      <button class="btn btn_primary" @click="addSignature" :disabled="!isDraw">確定</button>
    </div>
  </sign-popup>
</template>
