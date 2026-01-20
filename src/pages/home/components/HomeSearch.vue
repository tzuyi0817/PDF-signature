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
  <label class="relative m-3 w-[90%] max-w-100 md:absolute md:-top-16">
    <svg-search :color="searchIconColor" />
    <svg-icon
      v-show="isShowClose"
      name="close_s"
      class="absolute top-0 right-1 h-10 w-10"
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
