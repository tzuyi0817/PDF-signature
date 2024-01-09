<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useLiteralStore } from '@/store';
import SignaturePopup from '@/components/signature/SignaturePopup.vue';
import SignIcon from '@/components/SignIcon.vue';
import useWarnPopup from '@/hooks/useWarnPopup';
import toast from '@/utils/toast';

interface Props {
  isShowLiteral: boolean;
}

defineProps<Props>();
const emit = defineEmits(['update:isShowLiteral', 'useLiteral']);
const currentSelect = ref('');
const isShowLiteralPopup = ref(false);
const literal = ref('');
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
  useLiteralStore().addLiteral(literal.value);
  toast.showToast(t('prompt.text_add_success'), 'success');
  toggleLiteralPopup(false);
  literal.value = '';
}

function deleteLiteral() {
  useLiteralStore().deleteLiteral(currentSelect.value);
  toast.showToast(t('prompt.text_delete_success'), 'success');
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
    :is-show-popup="isShowLiteral"
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
        alt=""
        width="60"
        height="60"
        class="iconScale mb-3"
        @click="toggleLiteralPopup(true)"
      />
      <li
        v-for="literal in literalList"
        :key="literal"
        :class="[
          'rounded-[20px] relative w-full flex justify-center cursor-pointer',
          currentSelect === literal ? 'bg-primary opacity-70' : 'bg-white',
        ]"
        @click="selectLiteral(literal)"
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
          class="absolute top-1 right-1 w-10 h-10 text-gray-80 hover:text-gray-60"
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
      <h5 class="text-secondary text-center">{{ $t('add_commonly_use_text') }}</h5>
    </div>
  </signature-popup>

  <sign-popup
    v-if="isShowLiteralPopup"
    :title="$t('add_text')"
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
        @click="addLiteral"
      >
        {{ $t('confirm') }}
      </button>
    </div>
  </sign-popup>

  <sign-popup
    v-if="isShowWarnPopup"
    :title="$t('warn')"
  >
    <p class="text-center">{{ $t('prompt.sure_delete_text') }}</p>
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
