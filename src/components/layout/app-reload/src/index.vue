<script setup lang="ts">
defineOptions({ name: 'AppReload' });

function reload() {
  globalThis.location.reload();
}
</script>

<template>
  <teleport to="#loading-reload">
    <button
      class="btn btn-primary mx-2 h-fit w-fit max-w-140 text-sm wrap-break-word whitespace-normal md:text-base"
      @click="reload"
    >
      {{ $t('prompt.error_occurred') }}
    </button>
  </teleport>
</template>
