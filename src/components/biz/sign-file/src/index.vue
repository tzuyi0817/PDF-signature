<script setup lang="ts">
import { loadFile } from '@component-hook/pdf-canvas/vue';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { BlobImage, SvgIcon } from '@/components/common';
import { SvgList } from '@/components/svg';
import { useConfigStore, usePdfStore } from '@/stores';
import { sleep, transformTimestamp } from '@/utils/common';
import { generatePDF } from '@/utils/jspdf';
import type { MenuTab } from '@/types/menu';
import type { PDF } from '@/types/pdf';

interface Props {
  file: PDF;
  index: number;
  type: MenuTab;
  isListStatus: boolean;
  keyword: string;
  isSelectAll: boolean | 'mixed';
}

defineOptions({ name: 'SignFile' });

const { file, type, keyword, isSelectAll } = defineProps<Props>();
const emit = defineEmits(['openWarnPopup', 'openEncryptPopup', 'selectFile']);
const isShowMore = ref(false);
const isSelected = ref(false);
const router = useRouter();
const { addPDF, addArchive, addTrash, deleteArchive, deleteTrash, setCurrentPDF } = usePdfStore();
const { toggleLoading } = useConfigStore();

const localTime = computed(() => {
  return transformTimestamp(file.updateDate);
});

const more = computed(() => {
  const moreMap = {
    file: [
      { icon: 'download', feat: () => openEncryptPopup() },
      { icon: 'sign', feat: () => editFile() },
      { icon: 'archive', feat: () => moveToArchive() },
      { icon: 'trash', feat: () => moveToTrash() },
    ],
    archive: [
      { icon: 'reduction', feat: () => reductionArchive() },
      { icon: 'trash', feat: () => moveToTrash() },
    ],
    trash: [
      { icon: 'reduction', feat: () => reductionTrash() },
      { icon: 'trash', feat: () => openWarnPopup() },
    ],
  };

  return moreMap[type];
});

function openEncryptPopup() {
  toggleMore(false);
  emit('openEncryptPopup', file);
}

async function editFile() {
  toggleLoading({ isShow: true, title: 'upload_file', content: 'file_uploading' });

  const [pdf] = await Promise.all([generatePDF(file), sleep(300)]);

  if (!pdf) return;

  const content = await loadFile(pdf);

  setCurrentPDF({ ...file, ...content, PDFId: file.PDFId, canvas: [], isUpdate: true });
  toggleLoading({ isShow: false });
  router.push({ name: 'signature' });
}

function moveToArchive() {
  addArchive(file);
  emit('selectFile', file, false);
}

function moveToTrash() {
  addTrash(file, type);
  emit('selectFile', file, false);
}

function reductionArchive() {
  deleteArchive(file.PDFId);
  emit('selectFile', file, false);
  addPDF(file);
}

function reductionTrash() {
  deleteTrash(file.PDFId);
  emit('selectFile', file, false);
  addPDF(file);
}

function openWarnPopup() {
  toggleMore(false);
  emit('openWarnPopup', file);
}

function toggleMore(isOpen: boolean) {
  isShowMore.value = isOpen;
}

function splitName(name: string) {
  const start = name.toLowerCase().indexOf(keyword.toLowerCase());
  const end = start + keyword.length;
  const spiltName = [name.slice(0, start), name.slice(start, end), name.slice(end)];

  return spiltName.reduce((html, str, index) => {
    if (!str) return html;

    return `${html}<span class="${index === 1 ? 'text-primary' : ''}">${str}</span>`;
  }, '');
}

function selectFile() {
  isSelected.value = !isSelected.value;
  emit('selectFile', file, isSelected.value);
}

watch(
  () => isSelectAll,
  isSelect => {
    if (isSelect === 'mixed') return;
    isSelected.value = isSelect;
  },
);
</script>

<template>
  <li
    :class="[
      'sign-file flex flex-col',
      isListStatus ? 'lg:flex-row' : 'lg:h-fit lg:w-79 lg:shrink-0',
      { active: isSelected },
    ]"
    @click="selectFile"
  >
    <div :class="['transition-opacity lg:hidden', isShowMore ? 'z-10 opacity-100' : '-z-1 opacity-0']">
      <template v-if="isShowMore">
        <div
          class="mask"
          @click.stop="toggleMore(false)"
        ></div>

        <ul class="sign-file-more dark:bg-gray-80 bg-white">
          <li
            v-for="effect in more"
            :key="effect.icon"
          >
            <svg-icon
              :name="effect.icon"
              class="h-10 w-10"
              @click.stop="effect.feat"
            />
          </li>
        </ul>
      </template>
    </div>

    <svg-icon
      v-if="more.length"
      name="more"
      :class="`absolute top-1 right-2 h-10 w-10 ${isShowMore ? 'opacity-0' : 'opacity-100'} lg:hidden`"
      @click.stop="toggleMore(true)"
    />
    <svg-icon
      v-else
      name="reduction"
      class="absolute top-1 right-2 h-10 w-10 lg:hidden"
      @click.stop="reductionTrash"
    />

    <div :class="['flex h-37.5 w-1/3 items-center justify-center', { 'lg:hidden': isListStatus }]">
      <blob-image
        :blob="file.canvas?.at(0)"
        class="border-gray-20 w-full border-2"
        alt="file"
      />
    </div>

    <div
      :class="[
        'sign-file-content mt-4 flex-col text-center',
        { 'lg:mt-0 lg:w-full lg:flex-row lg:items-center lg:text-start': isListStatus },
      ]"
    >
      <div :class="{ 'lg:flex lg:flex-1 lg:flex-row-reverse lg:items-center lg:gap-1': isListStatus }">
        <p
          class="flex-1"
          v-html="splitName(file.name)"
        ></p>

        <p :class="['text-gray-40', { 'lg:text-surface-text lg:w-59': isListStatus }]">
          {{ localTime }}
        </p>

        <svg-list v-if="isListStatus" />
      </div>

      <ul :class="['hidden flex-row justify-center gap-1 lg:flex', { 'mt-4': !isListStatus }]">
        <li
          v-for="effect in more"
          :key="effect.icon"
        >
          <svg-icon
            :name="effect.icon"
            class="h-10 w-10"
            @click.stop="effect.feat"
          />
        </li>
      </ul>
    </div>
  </li>
</template>

<style lang="css" scoped>
.sign-file {
  position: relative;
  background-color: var(--color-card-bg);
  border: 2px solid var(--color-card-border);
  padding: 16px;
  border-radius: 20px;
  box-shadow:
    0px 2px 6px rgba(0, 0, 0, 0.12),
    0px 2px 10px rgba(0, 0, 0, 0.08),
    inset 0px -2px 4px rgba(215, 215, 215, 0.5);
  margin-bottom: 24px;
  transition: border-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

@media (min-width: 1024px) {
  .sign-file:hover {
    background: var(--color-card-hover);
  }
}

.sign-file.active {
  border-color: var(--color-primary);
  background: var(--color-card-hover);
}

.sign-file-more {
  position: absolute;
  right: 8px;
  top: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 12px;
  border: 2px solid var(--color-primary);
  box-shadow: 0 1px 3px 0 var(--color-primary);
  border-radius: 20px;
}

.sign-file:hover .sign-file-content:deep(svg rect),
.sign-file:hover .sign-file-content:deep(svg path) {
  stroke: var(--color-primary);
}

.sign-file-content {
  display: flex;
  gap: 4px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
