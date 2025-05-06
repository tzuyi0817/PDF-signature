<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { showToast } from '@/components/common';
import SignIcon from '@/components/SignIcon.vue';
import { useWarnPopup } from '@/hooks/use-warn-popup';
import { useLiteralStore } from '@/store';
import type { DragOffset } from '@/types/drag';
import type { SignatureTool } from '@/types/menu';
import SignaturePopup from './SignaturePopup.vue';

const emit = defineEmits(['useLiteral']);
const currentTool = defineModel<SignatureTool | ''>('currentTool');
const dragOffset = defineModel<DragOffset>('dragOffset', { required: true });
const currentSelect = ref('');
const isShowLiteralPopup = ref(false);
const literal = ref('');
const isEditing = ref(false);
const { literalList } = storeToRefs(useLiteralStore());
const { t } = useI18n();
const { isShowWarnPopup, SignPopup, toggleWarnPopup } = useWarnPopup();

function useLiteral() {
  emit('useLiteral', currentSelect.value, 'text');
  close();
}

function selectLiteral(text: string) {
  currentSelect.value = text;
}

function addLiteral() {
  if (literalList.value.includes(literal.value)) {
    showToast({ message: t('prompt.text_already_exists'), type: 'error' });
    return;
  }
  useLiteralStore().addLiteral(literal.value);
  showToast(t('prompt.text_add_success'));
  toggleLiteralPopup(false);
}

function editLiteral() {
  if (currentSelect.value === literal.value) {
    toggleLiteralPopup(false);
    return;
  }
  if (literalList.value.includes(literal.value)) {
    showToast({ message: t('prompt.text_already_exists'), type: 'error' });
    return;
  }
  const { addLiteral: addText, deleteLiteral: deleteText } = useLiteralStore();

  addText(literal.value);
  deleteText(currentSelect.value);
  showToast(t('prompt.text_edit_success'));
  currentSelect.value = literal.value;
  toggleLiteralPopup(false);
}

function deleteLiteral() {
  useLiteralStore().deleteLiteral(currentSelect.value);
  showToast(t('prompt.text_delete_success'));
  toggleWarnPopup(false);
  currentSelect.value = '';
}

function toggleLiteralPopup(isOpen: boolean, isEdit = false) {
  isEditing.value = isEdit;
  isShowLiteralPopup.value = isOpen;
  literal.value = isEdit ? currentSelect.value : '';
}

function dragLiteral(event: DragEvent) {
  const { textContent, offsetHeight, offsetWidth } = event.target as HTMLParagraphElement;
  const offsetX = event.offsetX / offsetWidth;
  const offsetY = event.offsetY / offsetHeight;

  event.dataTransfer?.setData('text/plain', textContent ?? '');
  event.dataTransfer?.setData('custom/offset', JSON.stringify({ offsetX, offsetY }));
  dragOffset.value = { x: event.offsetX, y: event.offsetY, width: offsetWidth, height: offsetHeight };
}

function close() {
  currentTool.value = '';
}
</script>

<template>
  <signature-popup
    :is-show-popup="currentTool === 'literal'"
    :title="$t('text_library')"
    :is-disabled="!currentSelect"
    @close="close"
    @use="useLiteral"
  >
    <ul
      v-if="literalList.length"
      class="signature-list"
    >
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt="add dark icon"
        width="60"
        height="60"
        class="iconScale mb-3"
        @click="toggleLiteralPopup(true)"
      />
      <li
        v-for="word in literalList"
        :key="word"
        :class="[
          'rounded-[20px] relative w-full flex cursor-pointer px-3 py-4',
          currentSelect === word ? 'bg-primary opacity-70' : 'bg-white',
        ]"
        draggable="true"
        @dragstart="dragLiteral"
        @click="selectLiteral(word)"
      >
        <p class="whitespace-pre-wrap w-full text-ellipsis overflow-hidden">
          <span class="inline">{{ word }}</span>
          <sign-icon
            v-show="currentSelect === word"
            name="edit"
            class="w-5 h-5 text-gray-80 inline relative scale-150 -top-[2px]"
            hover-color="hover:text-green-600"
            @click="toggleLiteralPopup(true, true)"
          />
        </p>
        <sign-icon
          v-show="currentSelect === word"
          name="close_s"
          class="absolute top-1 right-1 w-8 h-8 text-gray-80"
          hover-color="hover:text-danger"
          @click="toggleWarnPopup(true)"
        />
      </li>
    </ul>

    <div
      v-else
      class="signature-list justify-center"
    >
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt="add dark icon"
        width="80"
        height="80"
        class="iconScale mb-5"
        @click="toggleLiteralPopup(true)"
      />
      <h5 class="text-secondary text-center">
        {{ $t('add_commonly_use_text') }}
      </h5>
    </div>
  </signature-popup>

  <sign-popup
    v-if="isShowLiteralPopup"
    :title="isEditing ? $t('edit_text') : $t('add_text')"
  >
    <textarea
      v-model="literal"
      class="input my-5 h-[40dvh] rounded-[20px]"
    ></textarea>

    <div class="flex justify-between md:justify-evenly">
      <button
        class="btn btn-base"
        @click="toggleLiteralPopup(false)"
      >
        {{ $t('cancel') }}
      </button>
      <button
        class="btn btn-primary"
        :disabled="!literal"
        @click="() => (isEditing ? editLiteral() : addLiteral())"
      >
        {{ $t('confirm') }}
      </button>
    </div>
  </sign-popup>

  <sign-popup
    v-if="isShowWarnPopup"
    :title="$t('warn')"
  >
    <p class="text-center">
      {{ $t('prompt.sure_delete_text') }}
    </p>
    <div class="flex justify-between md:justify-evenly">
      <button
        class="btn btn-base"
        @click="toggleWarnPopup(false)"
      >
        {{ $t('not_yet') }}
      </button>
      <button
        class="btn btn-primary"
        @click="deleteLiteral"
      >
        {{ $t('delete') }}
      </button>
    </div>
  </sign-popup>
</template>
