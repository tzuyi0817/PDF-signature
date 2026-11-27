<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { BlobImage } from '@/components/common';
import { hasOriginalPDF } from '@/utils/pdf-document';
import { openPreview, type PreviewDocument } from '@/utils/pdf-preview';
import CompletePreviewOverlays from './CompletePreviewOverlays.vue';
import CompletePreviewPage from './CompletePreviewPage.vue';
import type { PDF } from '@/types/pdf';

interface Props {
  file: PDF;
  scrollRoot: HTMLElement | null;
}

const { file } = defineProps<Props>();
const preview = shallowRef<PreviewDocument | null>(null);
const isFailed = ref(false);

const original = computed(() => (hasOriginalPDF(file) ? file.data : null));

const isImage = computed(() => original.value?.type.startsWith('image/') ?? false);

const pdfSource = computed(() => (isImage.value ? null : original.value));

const overlays = computed(() => file.overlays ?? []);

function getPageOverlays(pageNumber: number) {
  return overlays.value.filter(overlay => overlay.page === pageNumber);
}

watch(
  pdfSource,
  async (source, _, onCleanup) => {
    let isStale = false;
    let opened: PreviewDocument | null = null;

    onCleanup(() => {
      isStale = true;
      preview.value = null;
      void opened?.destroy();
    });
    isFailed.value = false;

    if (!source) return;

    try {
      opened = await openPreview(source, file.password);

      if (isStale) {
        await opened.destroy();

        return;
      }
      preview.value = opened;
    } catch {
      isFailed.value = !isStale;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div
    :class="[
      'flex h-fit origin-top-left scale-150 flex-col gap-5 px-3 py-5 lg:scale-100 lg:px-14 lg:py-10',
      preview ? 'w-full' : 'w-fit',
    ]"
  >
    <template v-if="!original">
      <blob-image
        v-for="(canvas, index) in file.canvas"
        :key="index"
        :blob="canvas"
        alt="PDF document"
      />
    </template>

    <div
      v-else-if="isImage"
      class="relative w-fit"
    >
      <blob-image
        :blob="original"
        alt="PDF document"
      />
      <complete-preview-overlays :overlays />
    </div>

    <template v-else-if="preview">
      <complete-preview-page
        v-for="(size, index) in preview.pages"
        :key="index"
        :preview
        :page-number="index + 1"
        :size
        :overlays="getPageOverlays(index + 1)"
        :scroll-root
      />
    </template>

    <blob-image
      v-else-if="isFailed"
      :blob="file.thumbnail"
      alt="PDF document"
    />
  </div>
</template>
