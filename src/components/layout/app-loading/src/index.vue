<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { Popup } from '@/components/common';
import { useConfigStore } from '@/stores';

defineOptions({ name: 'AppLoading' });

const { loading } = storeToRefs(useConfigStore());
</script>

<template>
  <popup
    v-if="loading.isShow"
    :title="$t(loading.title)"
  >
    <div class="flex flex-col items-center gap-8 py-8">
      <img
        src="@/assets/img/loading.gif"
        class="w-[60%]"
        alt="loading gif"
      />

      <h5 class="text-surface-text text-center">
        {{ $t(loading.content) }}
      </h5>
    </div>
  </popup>
</template>
