<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useLiteralStore } from '@/store';
import SignaturePopup from '@/components/signature/SignaturePopup.vue';
import SignIcon from '@/components/SignIcon.vue';
import useWarnPopup from '@/hooks/useWarnPopup';
import toast from '@/utils/toast';

interface Props {
  isShowLiteral: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:isShowLiteral', 'useLiteral']);
const currentSelect = ref('');
const isShowLiteralPopup = ref(false);
const literal = ref('');
const { literalList } = storeToRefs(useLiteralStore());
const { isShowWarnPopup, SignPopup, toggleWarnPopup } = useWarnPopup();

function useLiteral() {
  emit('useLiteral', currentSelect.value, 'text');
  close();
}

function selectLiteral(text: string) {
  currentSelect.value = text;
}

function addLiteral() {
  useLiteralStore().addLiteral(literal.value);
  toast.showToast('文字新增成功', 'success');
  toggleLiteralPopup(false);
  literal.value = '';
}

function deleteLiteral() {
  useLiteralStore().deleteLiteral(currentSelect.value);
  toast.showToast('文字刪除成功', 'success');
  toggleWarnPopup(false);
  currentSelect.value = '';
}

function toggleLiteralPopup(isOpen: boolean) {
  isShowLiteralPopup.value = isOpen;
}

function dragLiteral(event: DragEvent) {
  const target = event.target as HTMLPreElement;

  event.dataTransfer?.setData('text/plain', target.innerText);
}

function close() {
  emit('update:isShowLiteral', false);
}
</script>

<template>
  <signature-popup
    :isShowPopup="isShowLiteral"
    title="文字庫"
    :isDisabled="!currentSelect"
    @close="close"
    @use="useLiteral"
  >
    <ul
      v-if="literalList.length"
      class="signature_list"
    >
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt=""
        width="60"
        height="60"
        class="iconScale mb-3"
        @click="toggleLiteralPopup(true)"
      />
      <li
        v-for="literal in literalList"
        :key="literal"
        @click="selectLiteral(literal)"
        :class="[
          'rounded-[20px] relative w-full flex justify-center cursor-pointer',
          currentSelect === literal ? 'bg-primary opacity-70' : 'bg-white',
        ]"
      >
        <p
          class="whitespace-pre-wrap w-full p-3"
          draggable="true"
          @dragstart="dragLiteral"
        >
          {{ literal }}
        </p>
        <sign-icon
          v-show="currentSelect === literal"
          name="close_s"
          @click="toggleWarnPopup(true)"
          class="absolute top-1 right-1 w-10 h-10 text-gray-80 hover:text-gray-60"
        />
      </li>
    </ul>

    <div
      v-else
      class="signature_list justify-center"
    >
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt=""
        width="80"
        height="80"
        class="iconScale mb-5"
        @click="toggleLiteralPopup(true)"
      />
      <h5 class="text-secondary">新增常用文字</h5>
    </div>
  </signature-popup>

  <sign-popup
    title="新增文字"
    v-if="isShowLiteralPopup"
  >
    <textarea
      class="input my-5 h-[40dvh] rounded-[20px]"
      v-model="literal"
    ></textarea>

    <div class="flex justify-between md:justify-evenly">
      <button
        class="btn btn_base"
        @click="toggleLiteralPopup(false)"
      >
        取消
      </button>
      <button
        class="btn btn_primary"
        :disabled="!literal"
        @click="addLiteral"
      >
        確定
      </button>
    </div>
  </sign-popup>

  <sign-popup
    title="警告"
    v-if="isShowWarnPopup"
  >
    <p class="text-center">確定要刪除此文字?</p>
    <div class="flex justify-between md:justify-evenly">
      <button
        class="btn btn_base"
        @click="toggleWarnPopup(false)"
      >
        先不要
      </button>
      <button
        class="btn btn_primary"
        @click="deleteLiteral"
      >
        刪除
      </button>
    </div>
  </sign-popup>
</template>
