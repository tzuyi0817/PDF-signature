/** 讓瀏覽器有時間開始下載後再釋放 object URL */
const REVOKE_DELAY = 1000;

/**
 * 把檔案存到使用者的裝置：以暫時的 object URL 觸發瀏覽器下載，檔名用 `file.name`。
 *
 * 只能在瀏覽器執行；整個過程不經網路，離線時也能用。
 */
export function saveFile(file: File) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = file.name;
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY);
}
