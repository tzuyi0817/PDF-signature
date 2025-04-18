<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import SignIcon from '@/components/SignIcon.vue';
import SvgList from '@/components/svg/SvgList.vue';
import { usePdfStore } from '@/store';
import { transformTimestamp } from '@/utils/common';
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

const { file, type, keyword, isSelectAll } = defineProps<Props>();
const emit = defineEmits(['openWarnPopup', 'openEncryptPopup', 'selectFile']);
const isShowMore = ref(false);
const isSelected = ref(false);
const router = useRouter();
const { addPDF, addArchive, addTrash, deleteArchive, deleteTrash, setCurrentPDF } = usePdfStore();

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

function editFile() {
  setCurrentPDF({ ...file, isUpdate: true });
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
      isListStatus ? 'md:flex-row' : 'md:w-[316px] md:flex-shrink-0 md:h-fit',
      { active: isSelected },
    ]"
    @click="selectFile"
  >
    <div :class="['transition-opacity md:hidden', isShowMore ? 'opacity-100 z-10' : 'opacity-0 -z-[1]']">
      <template v-if="isShowMore">
        <div
          class="mask"
          @click.stop="toggleMore(false)"
        ></div>
        <ul class="sign-file-more bg-white">
          <li
            v-for="effect in more"
            :key="effect.icon"
          >
            <sign-icon
              :name="effect.icon"
              class="w-10 h-10"
              @click.stop="effect.feat"
            />
          </li>
        </ul>
      </template>
    </div>
    <sign-icon
      v-if="more.length"
      name="more"
      :class="`absolute w-10 h-10 right-2 top-1 ${isShowMore ? 'opacity-0' : 'opacity-100'} md:hidden`"
      @click.stop="toggleMore(true)"
    />
    <sign-icon
      v-else
      name="reduction"
      class="absolute w-10 h-10 right-2 top-1 md:hidden"
      @click.stop="reductionTrash"
    />

    <div :class="['w-1/3 h-[150px] flex items-center justify-center', { 'md:hidden': isListStatus }]">
      <img
        :src="file.canvas?.at(0)"
        class="border-2 border-gray-20 w-full"
        alt="file"
      />
    </div>

    <div
      :class="[
        'sign-file-content flex-col mt-4 text-center',
        { 'md:mt-0 md:flex-row md:items-center md:w-full md:text-start': isListStatus },
      ]"
    >
      <div :class="{ 'md:flex md:flex-row-reverse md:items-center md:gap-1 md:flex-1': isListStatus }">
        <p
          class="flex-1"
          v-html="splitName(file.name)"
        ></p>
        <p :class="['text-gray-40', { 'md:text-black md:w-[236px]': isListStatus }]">
          {{ localTime }}
        </p>

        <svg-list v-if="isListStatus" />
      </div>
      <ul :class="['flex-row gap-1 hidden justify-center md:flex', { 'mt-4': !isListStatus }]">
        <li
          v-for="effect in more"
          :key="effect.icon"
        >
          <sign-icon
            :name="effect.icon"
            class="w-10 h-10"
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
  border: 2px solid var(--color-secondary-tint);
  padding: 16px;
  border-radius: 20px;
  box-shadow:
    0px 2px 6px rgba(0, 0, 0, 0.12),
    0px 2px 10px rgba(0, 0, 0, 0.08),
    inset 0px -2px 4px rgba(215, 215, 215, 0.5);
  margin-bottom: 24px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

@media (min-width: 768px) {
  .sign-file:hover {
    background: linear-gradient(to bottom, white, rgba(183, 236, 93, 0.3));
  }
}

.sign-file.active {
  border-color: var(--color-primary);
  background: linear-gradient(to bottom, white, rgba(183, 236, 93, 0.3));
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
