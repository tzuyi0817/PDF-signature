<script setup lang="ts">
interface Props {
  isPrevDisabled?: boolean;
  isNextDisabled?: boolean;
}

defineProps<Props>();
const emit = defineEmits(['prevStep', 'nextStep']);
</script>

<template>
  <div class="sign-step-btn">
    <button
      class="btn"
      :disabled="isPrevDisabled"
      @click="emit('prevStep')"
    >
      <span class="text-4xl font-thin">←</span>{{ $t('previous') }}
    </button>
    <button
      class="btn btn-primary"
      :disabled="isNextDisabled"
      @click="emit('nextStep')"
    >
      {{ $t('next_step') }}<span class="text-4xl font-thin">→</span>
    </button>
  </div>
</template>

<style lang="css" scoped>
.sign-step-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 10px;
}

@media (min-width: 768px) {
  .sign-step-btn {
    position: absolute;
    top: 24px;
    left: 20px;
    width: calc(100% - 70px);
  }
}
</style>
