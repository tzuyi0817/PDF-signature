<script setup lang="ts">
import { onMounted } from 'vue';

interface Props {
  title: string;
}

defineProps<Props>();
const emit = defineEmits(['childMounted', 'closePopup']);

onMounted(() => emit('childMounted'));
</script>

<template>
  <teleport to="body">
    <div
      class="sign-popup mask"
      @click.self="$emit('closePopup')"
    >
      <div class="sign-popup-box">
        <h5 class="border-b-2 border-primary py-1 px-4 text-center font-medium md:pb-4">
          {{ title }}
        </h5>
        <slot></slot>
      </div>
    </div>
  </teleport>
</template>

<style lang="css" scoped>
.sign-popup {
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.sign-popup-box {
  width: 90%;
  max-width: 530px;
  min-height: 261px;
  padding: 16px 32px 28px;
  box-shadow:
    0px 4px 15px rgba(0, 0, 0, 0.2),
    inset 0px 2px 5px rgba(135, 135, 135, 0.2),
    inset 0px 3px 10px rgba(215, 215, 215, 0.2),
    inset 0px -1px 4px rgba(135, 135, 135, 0.6),
    inset 0px -6px 6px rgba(215, 215, 215, 0.4);
  border-radius: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: white;
}

@media (min-width: 768px) {
  .sign-popup-box {
    min-height: 335px;
    max-height: 566px;
  }
}
</style>
