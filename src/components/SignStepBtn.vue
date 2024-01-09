<script setup lang="ts">
interface Props {
  isNextDisabled: boolean;
}

defineProps<Props>();
const emit = defineEmits(['prevStep', 'nextStep']);
</script>

<template>
  <div class="sign_step_btn">
    <button
      class="btn"
      @click="emit('prevStep')"
    >
      <span class="text-4xl font-thin">←</span>{{ $t('previous') }}
    </button>
    <button
      class="btn btn_primary"
      :disabled="isNextDisabled"
      @click="emit('nextStep')"
    >
      {{ $t('next_step') }}<span class="text-4xl font-thin">→</span>
    </button>
  </div>
</template>

<style lang="postcss" scoped>
.sign_step_btn {
  @apply flex
  items-center
  justify-between
  mx-[10px]
  md:absolute
  md:top-6
  md:left-5
  md:w-[calc(100%-70px)];
}
</style>
