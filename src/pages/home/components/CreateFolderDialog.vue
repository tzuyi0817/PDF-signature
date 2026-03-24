<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Popup, showToast } from '@/components/common';
import { useFolderStore } from '@/stores';
import type { Folder } from '@/types/folder';

interface Props {
  /** 傳入時為重新命名模式 */
  renameTarget?: Folder;
}

interface Emits {
  close: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();
const folderStore = useFolderStore();

const folderName = ref(props.renameTarget?.name ?? '');
const inputRef = ref<HTMLInputElement>();

const title = props.renameTarget ? t('folder.rename') : t('folder.create');

onMounted(() => {
  nextTick(() => {
    inputRef.value?.focus();
    inputRef.value?.select();
  });
});

function confirm() {
  const name = folderName.value.trim();

  if (!name) return;

  if (props.renameTarget) {
    folderStore.renameFolder(props.renameTarget.folderId, name);
    showToast(t('folder.renamed'));
  } else {
    folderStore.createFolder(name);
    showToast(t('folder.created'));
  }

  emit('close');
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    confirm();
  }
}
</script>

<template>
  <popup
    :title="title"
    @close-popup="emit('close')"
  >
    <div class="px-6">
      <input
        ref="inputRef"
        v-model.trim="folderName"
        type="text"
        class="input"
        :placeholder="t('folder.name_placeholder')"
        maxlength="50"
        @keydown="handleKeydown"
      />
    </div>

    <div class="flex justify-between lg:justify-evenly">
      <button
        class="btn btn-base"
        @click="emit('close')"
      >
        {{ t('not_yet') }}
      </button>
      <button
        class="btn btn-primary"
        :disabled="!folderName.trim()"
        @click="confirm"
      >
        {{ t('confirm') }}
      </button>
    </div>
  </popup>
</template>
