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

      <h5 class="text-gray-40 text-center">
        {{ $t(loading.content) }}
      </h5>
      <div
        v-if="loading.isProcess"
        class="bg-gray-30 h-2 w-[90%] rounded"
      >
        <div
          class="bg-primary h-full rounded transition-all"
          :style="{ width: `${loading.completeness}%` }"
        ></div>
        <p class="mt-1 text-center text-sm md:text-base">
          {{ `${$t('download_progress')} ${Math.floor(loading.completeness)}%` }}
        </p>
      </div>
    </div>
  </popup>
</template>
