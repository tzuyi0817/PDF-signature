<script lang="ts" setup>
import { computed, ref } from 'vue';
import { SvgIcon } from '@/components/common';
import { SvgSearch } from '@/components/svg';

const keyword = defineModel();
const searchIconColor = ref('#CCCCCC');
const isShowClose = computed(() => keyword.value);

function focus() {
  searchIconColor.value = '#B7EC5D';
}

function blur() {
  searchIconColor.value = '#CCCCCC';
}

function clear() {
  keyword.value = '';
}
</script>

<template>
  <label class="relative mx-auto my-3 block w-[90%] max-w-100 lg:absolute lg:-top-17 lg:left-1/2 lg:-translate-x-1/2">
    <svg-search :color="searchIconColor" />
    <svg-icon
      v-show="isShowClose"
      name="close_s"
      class="absolute top-1/2 right-1 h-10 w-10 -translate-y-1/2"
      @click="clear"
    />
    <input
      v-model.trim="keyword"
      type="text"
      class="input pl-12"
      :placeholder="$t('placeholder.keyword')"
      @focus="focus"
      @blur="blur"
    />
  </label>
</template>
