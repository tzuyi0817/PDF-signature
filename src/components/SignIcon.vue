<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  name: string;
  hoverColor?: string;
  prefix?: string;
  color?: string;
  hoverChangeSvg?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hoverColor: 'hover:text-primary',
  prefix: 'icon',
  color: '#4D4D4D',
  hoverChangeSvg: false,
});

const isHover = ref(false);
const symbolId = computed(() => {
  const symbol = `#${props.prefix}-ic_${props.name}`;

  if (props.hoverChangeSvg && isHover.value && !props.name.includes('_h')) return `${symbol}_h`;
  return symbol;
});
</script>

<template>
  <svg
    aria-hidden="true"
    :title="symbolId"
    :class="['cursor-pointer', { [`transition-[color_transform] ${hoverColor}`]: !hoverChangeSvg }]"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <use
      :href="symbolId"
      :fill="color"
    />
  </svg>
</template>
