<script lang="ts" setup>
import SignPopup from '@/components/SignPopup.vue';
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store';

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

      <h5 class="text-center text-gray-40">{{ $t(loading.content) }}</h5>
    </div>
  </sign-popup>
</template>
