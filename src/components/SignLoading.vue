<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import SignPopup from '@/components/SignPopup.vue';
import { useConfigStore } from '@/stores';

const { loading } = storeToRefs(useConfigStore());
</script>

<template>
  <sign-popup
    v-if="loading.isShow"
    :title="$t(loading.title)"
  >
    <div class="flex flex-col gap-8 items-center py-8">
      <img
        src="@/assets/img/loading.gif"
        class="w-[60%]"
        alt="loading gif"
      />

      <h5 class="text-center text-gray-40">
        {{ $t(loading.content) }}
      </h5>
      <div
        v-if="loading.isProcess"
        class="w-[90%] h-2 rounded bg-gray-30"
      >
        <div
          class="h-full bg-primary transition-all rounded"
          :style="{ width: `${loading.completeness}%` }"
        ></div>
        <p class="text-center mt-1 text-sm md:text-base">
          {{ `${$t('download_progress')} ${Math.floor(loading.completeness)}%` }}
        </p>
      </div>
    </div>
  </sign-popup>
</template>
