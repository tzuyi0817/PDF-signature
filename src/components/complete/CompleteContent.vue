<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePdfStore } from '@/store';
import SignIcon from '@/components/SignIcon.vue';
import useWarnPopup from '@/hooks/useWarnPopup';
import { downloadPDF } from '@/utils/jspdf';
import toast from '@/utils/toast';

type WarnType = 'archive' | 'trash';

const warnType = ref<WarnType>('archive');
const { currentPDF } = storeToRefs(usePdfStore());
const { isShowWarnPopup, SignPopup, goPage, toggleWarnPopup } = useWarnPopup();
const warnContent = computed(() => {
  const contentMap = {
    archive: '確定要封存此檔案?',
    trash: '確定要刪除此檔案?',
  };
  return contentMap[warnType.value];
});

function download() {
  downloadPDF(currentPDF.value);
}

function openWarnPopup(type: WarnType) {
  warnType.value = type;
  toggleWarnPopup(true);
}

function warnConfirm() {
  const { addArchive, addTrash } = usePdfStore();
  const isArchive = warnType.value === 'archive';

  isArchive ? addArchive(currentPDF.value) : addTrash(currentPDF.value);
  toast.showToast(`檔案${isArchive ? '封存' : '刪除'}成功`, 'success');
  toggleWarnPopup(false);
  !isArchive && goPage('index');
}
</script>

<template>
  <div class="complete_content content">
    <h5 class="title text-center w-full">簽署完成</h5>

    <ul class="toolbar md:absolute md:right-10 md:top-5">
      <li>
        <sign-icon
          name="download"
          class="w-9 h-9"
          @click="download"
        />
      </li>
      <li>
        <sign-icon
          name="archive"
          class="w-9 h-9"
          @click="openWarnPopup('archive')"
        />
      </li>
      <li>
        <sign-icon
          name="trash"
          class="w-9 h-9"
          @click="openWarnPopup('trash')"
        />
      </li>
    </ul>

    <div class="complete_content_file">
      <div class="w-fit h-fit py-5 px-3 scale-150 origin-top-left flex flex-col gap-5 md:scale-100 md:py-10 md:px-14">
        <template
          v-for="canvas in currentPDF.canvas"
          :key="canvas"
        >
          <img
            :src="canvas"
            alt="PDF document"
          />
        </template>
      </div>
    </div>

    <button
      class="btn btn_primary md:absolute md:left-10 md:top-7"
      :disabled="false"
      @click="goPage('index')"
    >
      <span class="text-4xl font-thin">←</span>回首頁
    </button>

    <sign-popup
      v-if="isShowWarnPopup"
      title="警告"
    >
      <p class="text-center">{{ warnContent }}</p>
      <div class="flex justify-between md:justify-evenly">
        <button
          class="btn btn_base"
          @click="toggleWarnPopup(false)"
        >
          先不要
        </button>
        <button
          class="btn btn_primary"
          @click="warnConfirm"
        >
          確定
        </button>
      </div>
    </sign-popup>
  </div>
</template>

<style lang="postcss" scoped>
.complete_content {
  @apply flex
  flex-col
  relative
  items-center;
  &_file {
    @apply mb-5
    bg-gray-30
    border-2
    border-gray-30
    overflow-auto
    w-[calc(100%-20px)]
    h-[calc(100%-178px)]
    max-w-[842px]
    md:mt-6
    md:h-[calc(100%-110px)];
  }
}
</style>
