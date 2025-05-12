<script setup lang="ts">
function reload() {
  window.location.reload();
}
</script>

<template>
  <teleport to="#loading-reload">
    <button
      class="btn btn-primary w-fit max-w-[560px] mx-2 h-fit whitespace-normal break-words text-sm md:text-base"
      @click="reload"
    >
      {{ $t('prompt.error_occurred') }}
    </button>
  </teleport>
</template>
