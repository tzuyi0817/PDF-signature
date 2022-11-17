<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import SignIcon from '@/components/SignIcon.vue';
import useFabric from '@/hooks/useFabric';
import type { MenuTab } from '@/types/menu';
import type { PDF } from '@/types/pdf';

interface Props {
  file: PDF;
  index: number;
  type: MenuTab;
}

const props = defineProps<Props>();
const isShowMore = ref(false);
const isShowCanvas = ref(false);

const canvasId = `canvas${props.index}`;
const { createCanvas, specifyPage } = useFabric(canvasId);

const time = computed(() => {
  const [iso] = new Date(props.file.updateDate).toISOString().split('.');
  return iso.replace(/T/, ' ');
});

const more = computed(() => {
  const moreMap = {
    file: ['download', 'archive', 'trash'],
    archive: ['reduction', 'trash'],
    trash: [],
  };
  return moreMap[props.type];
});

async function setPDF() {
  createCanvas();
  await specifyPage({
    page: 1,
    PDF: props.file,
    scale: 0.5,
  });
  isShowCanvas.value = true;
}

function toggleMore(isOpen: boolean) {
  isShowMore.value = isOpen;
}

onMounted(setPDF);
</script>

<template>
  <li class="sign_file">
    <div :class="['transition-all duration-500', isShowMore ? 'opacity-100 z-10' : 'opacity-0 -z-[1]']">
      <div v-if="isShowMore" class="mask" @click="toggleMore(false)"></div>
      <ul class="sign_file_more">
        <li class="cursor-pointer" v-for="effect in more" :key="effect">
          <sign-icon :icon="effect" @click="" />
        </li>
      </ul>
    </div>
    <sign-icon
      icon="more" 
      :customClass="`absolute right-2 top-1 ${isShowMore ? 'opacity-0' : 'opacity-100'}`"
      @click="toggleMore(true)"
    />
    <canvas v-show="isShowCanvas" :id="canvasId" class="border-2 border-gray-20"></canvas>
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