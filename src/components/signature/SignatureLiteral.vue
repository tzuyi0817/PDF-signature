<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useLiteralStore } from '@/store';
import SignaturePopup from '@/components/signature/SignaturePopup.vue';
import SignIcon from '@/components/SignIcon.vue';
import { useWarnPopup } from '@/hooks/use-warn-popup';
import { toast } from '@/utils/toast';
import type { SignatureTool } from '@/types/menu';

const emit = defineEmits(['useLiteral']);
const currentTool = defineModel<SignatureTool | ''>('currentTool');
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
    toast.showToast(t('prompt.text_already_exists'), 'error');
    return;
  }
  useLiteralStore().addLiteral(literal.value);
  toast.showToast(t('prompt.text_add_success'), 'success');
  toggleLiteralPopup(false);
}

function editLiteral() {
  if (currentSelect.value === literal.value) {
    toggleLiteralPopup(false);
    return;
  }
  if (literalList.value.includes(literal.value)) {
    toast.showToast(t('prompt.text_already_exists'), 'error');
    return;
  }
  const { addLiteral: addText, deleteLiteral: deleteText } = useLiteralStore();

  addText(literal.value);
  deleteText(currentSelect.value);
  toast.showToast(t('prompt.text_edit_success'), 'success');
  currentSelect.value = literal.value;
  toggleLiteralPopup(false);
}

function deleteLiteral() {
  useLiteralStore().deleteLiteral(currentSelect.value);
  toast.showToast(t('prompt.text_delete_success'), 'success');
  toggleWarnPopup(false);
  currentSelect.value = '';
}

function toggleLiteralPopup(isOpen: boolean, isEdit = false) {
  isEditing.value = isEdit;
  isShowLiteralPopup.value = isOpen;
  literal.value = isEdit ? currentSelect.value : '';
}

function dragLiteral(event: DragEvent) {
  const target = event.target as HTMLPreElement;

  event.dataTransfer?.setData('text', target.textContent ?? '');
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
      class="signature_list"
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
      class="signature_list justify-center"
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
        class="btn btn_base"
        @click="toggleLiteralPopup(false)"
      >
        {{ $t('cancel') }}
      </button>
      <button
        class="btn btn_primary"
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
        class="btn btn_base"
        @click="toggleWarnPopup(false)"
      >
        {{ $t('not_yet') }}
      </button>
      <button
        class="btn btn_primary"
        @click="deleteLiteral"
      >
        {{ $t('delete') }}
      </button>
    </div>
  </sign-popup>
</template>
