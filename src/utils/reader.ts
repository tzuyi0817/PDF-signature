import { showToast } from '@/components/common';
import { MAX_SIZE } from '@/constants/common';
import i18n from '@/plugins/i18n';

export function checkFile(files: FileList | null | undefined, regexp: RegExp, maxSize = MAX_SIZE) {
  if (!files) return;
  const { t } = i18n.global;
  const file = files[0];

  if (!regexp.test(file.type)) {
    showToast({ message: t('prompt.file_format_not_match'), type: 'error' });
    return;
  }

  if (file.size > maxSize) {
    showToast({ message: t('prompt.file_size_exceed'), type: 'error' });
    return;
  }
  return file;
}

export function readfile(file: File): Promise<FileReader['result']> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('load', () => resolve(fileReader.result));
    fileReader.addEventListener('error', reject);
    fileReader.readAsDataURL(file);
  });
}
