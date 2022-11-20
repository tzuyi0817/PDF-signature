<script setup lang="ts">
interface Props {
  isNextDisabled: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['prevStep', 'nextStep'])
</script>

<template>
  <div class="sign_step_btn">
    <button class="btn" @click="emit('prevStep')">
      <span class="text-4xl font-thin">←</span>上一步
    </button>
    <button 
      class="btn btn_primary"
      :disabled="isNextDisabled"
      @click="emit('nextStep')"
    >
      下一步<span class="text-4xl font-thin">→</span>
    </button>
  </div>
</template>

<style lang="postcss" scoped>
.sign_step_btn {
  @apply
  flex
  items-center
  justify-between
  mx-[10px]
  md:absolute
  md:top-6
  md:left-5
  md:w-[calc(100%-70px)];
}
</style>
