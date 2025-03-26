<script lang="ts" setup>
import { ref } from 'vue';
import { useWarnPopup } from '@/hooks/use-warn-popup';

interface Props {
  isShowMergePopup: boolean;
  cancelMergeFile: () => void;
}

defineProps<Props>();

const isMergeComplete = ref(false);
const { SignPopup, goPage } = useWarnPopup();
</script>

<template>
  <sign-popup
    v-if="isShowMergePopup"
    :title="$t('create_file')"
  >
    <div class="flex flex-col gap-8 items-center py-8">
      <img
        src="@/assets/img/loading.gif"
        class="w-[60%]"
        alt="loading gif"
      />

      <div
        v-if="isMergeComplete"
        class="text-center"
      >
        <h5 class="text-primary mb-[18px]">
          {{ $t('file_completed') }}
        </h5>
        <p class="text-gray-40">
          {{ $t('prompt.auto_jump_screen') }}
        </p>
      </div>
      <h5
        v-else
        class="text-center text-gray-40"
      >
        {{ $t('merging_files') }}
      </h5>
    </div>
    <div class="flex justify-between md:justify-evenly">
      <button
        v-if="isMergeComplete"
        class="btn btn-primary w-full"
        @click="goPage('complete')"
      >
        {{ $t('confirm') }}
      </button>
      <button
        v-else
        class="btn btn-base w-full"
        @click="cancelMergeFile"
      >
        {{ $t('cancel') }}
      </button>
    </div>
  </sign-popup>
</template>
