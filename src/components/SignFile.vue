<script setup lang="ts">
import { ref, computed } from 'vue';
import SignIcon from '@/components/SignIcon.vue';
import { usePdfStore } from '@/store';
import { downloadPDF } from '@/utils/jspdf';
import type { MenuTab } from '@/types/menu';
import type { PDF } from '@/types/pdf';

interface Props {
  file: PDF;
  index: number;
  type: MenuTab;
}

const props = defineProps<Props>();
const isShowMore = ref(false);
const time = computed(() => {
  const [date, time] = new Date(props.file.updateDate).toLocaleString('en-GB').split(',');
  const [day, month, year] = date.split('/');

  return `${year}-${month}-${day} ${time}`;
});

const more = computed(() => {
  const { file } = props;
  const { addArchive, addTrash } = usePdfStore();
  const moreMap = {
    file: [
      { icon: 'download', feat: download },
      { icon: 'archive', feat: () => addArchive(file) },
      { icon: 'trash', feat: () => addTrash(file) },
    ],
    archive: [
      { icon: 'reduction', feat: reductionArchive },
      { icon: 'trash', feat: () => addTrash(file) },
    ],
    trash: [],
  };
  return moreMap[props.type];
});

function download() {
  downloadPDF(props.file);
  toggleMore(false);
}

function reductionArchive() {
  const { addPDF, deleteArchive } = usePdfStore();
  const { file } = props;

  deleteArchive(file.PDFId);
  addPDF(file);
}

function reductionTrash() {
  const { addPDF, deleteTrash } = usePdfStore();
  const { file } = props;

  deleteTrash(file.PDFId);
  addPDF(file);
}

function toggleMore(isOpen: boolean) {
  isShowMore.value = isOpen;
}
</script>

<template>
  <li class="sign_file">
    <div :class="['transition-all duration-500', isShowMore ? 'opacity-100 z-10' : 'opacity-0 -z-[1]']">
      <div v-if="isShowMore" class="mask" @click="toggleMore(false)"></div>
      <ul class="sign_file_more">
        <li class="cursor-pointer" v-for="effect in more" :key="effect.icon">
          <sign-icon :icon="effect.icon" @click="effect.feat" />
        </li>
      </ul>
    </div>
    <sign-icon
      v-if="more.length"
      icon="more" 
      :customClass="`absolute right-2 top-1 ${isShowMore ? 'opacity-0' : 'opacity-100'}`"
      @click="toggleMore(true)"
    />
    <sign-icon v-else icon="reduction" customClass="absolute right-2 top-1" @click="reductionTrash" />
    <img :src="file.canvas?.at(0)" class="border-2 border-gray-20 w-1/3" alt="" />
    <p class="mt-4 mb-1">{{ file.name }}</p>
    <p class="text-gray-40">{{ time }}</p>
  </li>
</template>

<style lang="postcss" scoped>
.sign_file {
  @apply
  border-[2px]
  relative
  border-secondary-tint
  p-4
  flex
  flex-col
  items-center
  rounded-[20px]
  shadow-[0px_2px_6px_rgba(0,0,0,0.12),0px_2px_10px_rgba(0,0,0,0.08),inset_0px_-2px_4px_rgba(215,215,215,0.5)]
  mb-6
  justify-center;
  &_more {
    @apply
    absolute
    right-2
    top-2
    flex
    flex-col
    gap-4
    px-3
    py-5
    border-2
    border-primary
    shadow-primary
    shadow
    rounded-[20px];
  }
}
</style>