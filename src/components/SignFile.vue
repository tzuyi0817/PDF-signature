<script setup lang="ts">
import { ref, computed } from 'vue';
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
}

const { file, type, keyword } = defineProps<Props>();
const emit = defineEmits(['openWarnPopup', 'openEncryptPopup']);
const isShowMore = ref(false);
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
      { icon: 'archive', feat: () => addArchive(file) },
      { icon: 'trash', feat: () => addTrash(file) },
    ],
    archive: [
      { icon: 'reduction', feat: () => reductionArchive() },
      { icon: 'trash', feat: () => addTrash(file) },
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

function reductionArchive() {
  deleteArchive(file.PDFId);
  addPDF(file);
}

function reductionTrash() {
  deleteTrash(file.PDFId);
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
</script>

<template>
  <li :class="['sign_file flex flex-col', isListStatus ? 'md:flex-row' : 'md:w-[316px] md:flex-shrink-0 md:h-fit']">
    <div :class="['transition-opacity md:hidden', isShowMore ? 'opacity-100 z-10' : 'opacity-0 -z-[1]']">
      <template v-if="isShowMore">
        <div
          class="mask"
          @click="toggleMore(false)"
        ></div>
        <ul class="sign_file_more bg-white">
          <li
            v-for="effect in more"
            :key="effect.icon"
          >
            <sign-icon
              :name="effect.icon"
              class="w-10 h-10"
              @click="effect.feat"
            />
          </li>
        </ul>
      </template>
    </div>
    <sign-icon
      v-if="more.length"
      name="more"
      :class="`absolute w-10 h-10 right-2 top-1 ${isShowMore ? 'opacity-0' : 'opacity-100'} md:hidden`"
      @click="toggleMore(true)"
    />
    <sign-icon
      v-else
      name="reduction"
      class="absolute w-10 h-10 right-2 top-1 md:hidden"
      @click="reductionTrash"
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
        'sign_file_content flex-col mt-4 text-center',
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
            @click="effect.feat"
          />
        </li>
      </ul>
    </div>
  </li>
</template>

<style lang="postcss" scoped>
.sign_file {
  @apply border-2
  relative
  border-secondary-tint
  p-4
  items-center
  rounded-[20px]
  shadow-[0px_2px_6px_rgba(0,0,0,0.12),0px_2px_10px_rgba(0,0,0,0.08),inset_0px_-2px_4px_rgba(215,215,215,0.5)]
  mb-6
  transition-all
  justify-center
  md:hover:border-primary
  md:hover:bg-gradient-to-b from-white to-primary/30;
  &_more {
    @apply absolute right-2 top-2 flex flex-col gap-4 px-3 py-5 border-2 border-primary shadow-primary shadow rounded-[20px];
  }
  &:hover > .sign_file_content {
    :deep(svg) {
      rect,
      path {
        @apply stroke-primary;
      }
    }
  }
  &_content {
    @apply flex gap-1 transition-all;
  }
}
</style>
