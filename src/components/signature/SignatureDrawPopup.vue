<script setup lang="ts">
import { ref, defineAsyncComponent, getCurrentInstance } from 'vue';
import { useSignatureStore } from '@/store';
import SignIcon from '@/components/SignIcon.vue';

const emit = defineEmits(['close']);
const canvasDraw = ref<HTMLCanvasElement | null>(null);
const currentTool = ref('black');
const instance = getCurrentInstance();
const SignPopup = defineAsyncComponent(() => import('@/components/SignPopup.vue'));
const drawCtx = {
  ctx: null as CanvasRenderingContext2D | null | undefined, 
  isPainting: false,
};

function selectTool(tool: string) {
  currentTool.value = tool;
}

function add() {

}

function setCanvas() {
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
    return { x: (clientX - left) / 1.5, y: (clientY - top) / 2.5 };
  }

  const { touches } = event as TouchEvent;
  console.log({ top, left })
  console.log({ clientX: touches[0].clientX, clientY: touches[0].clientY })
  return {
    x:  touches[0].clientX - left,
    y: (touches[0].clientY - top) / 1.8,
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
}

function clear() {
  if (!canvasDraw.value) return;
  drawCtx.ctx?.clearRect(0, 0, canvasDraw.value.width, canvasDraw.value.height);
}
</script>

<template>
  <sign-popup title="建立簽名檔" :instance="instance" @childMounted="setCanvas">
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
      class="h-[40vh] bg-secondary-tint border-2 border-gray-30 rounded-[20px] mb-6"
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
      <button class="btn btn_primary" @click="add">確定</button>
    </div>
  </sign-popup>
</template>
