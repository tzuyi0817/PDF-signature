import { defineStore } from 'pinia';
import { IDB_KEY } from '@/constants/idb';
import { getIdb, setIdb } from '@/utils/idb';
import type { Folder } from '@/types/folder';

interface FolderStore {
  /** 所有資料夾清單 */
  folderList: Folder[];
  /** 目前瀏覽的資料夾 ID，null 表示根目錄 */
  currentFolderId: string | null;
}

const defaultState: FolderStore = {
  folderList: [],
  currentFolderId: null,
};

export const useFolderStore = defineStore('folder', {
  state: () => ({ ...defaultState }),
  persist: {
    pick: ['currentFolderId'],
  },
  getters: {
    /** 取得指定父層底下的資料夾（預設為目前瀏覽層）*/
    childFolders(state): (parentId?: string | null) => Folder[] {
      return (parentId?: string | null) => {
        const pid = parentId === undefined ? state.currentFolderId : parentId;

        return state.folderList.filter(folder => folder.parentId === pid);
      };
    },
    /** 從目前資料夾往上追溯至根目錄的路徑（含目前資料夾）*/
    breadcrumbs(state): Folder[] {
      const result: Folder[] = [];
      const folderMap = new Map(state.folderList.map(folder => [folder.folderId, folder]));
      let currentId = state.currentFolderId;

      while (currentId !== null) {
        const folder = folderMap.get(currentId);

        if (!folder) break;

        result.unshift(folder);
        currentId = folder.parentId;
      }

      return result;
    },
    /** 依 ID 取得資料夾 */
    getFolderById(state): (id: string) => Folder | undefined {
      return (id: string) => state.folderList.find(folder => folder.folderId === id);
    },
  },
  actions: {
    /** 從 IDB 載入資料夾清單 */
    async getFolders() {
      const list = await getIdb<Folder[]>(IDB_KEY.FOLDER_LIST);

      if (!list) return;

      this.folderList = list;

      return list;
    },
    /** 建立資料夾 */
    createFolder(name: string) {
      const now = Date.now();
      const folder: Folder = {
        folderId: crypto.randomUUID(),
        name,
        parentId: this.currentFolderId,
        createDate: now,
        updateDate: now,
      };

      this.folderList.unshift(folder);
      this.updateFolderIdb();

      return folder;
    },
    /** 重新命名資料夾 */
    renameFolder(folderId: string, name: string) {
      const folder = this.folderList.find(f => f.folderId === folderId);

      if (!folder) return;

      folder.name = name;
      folder.updateDate = Date.now();

      return this.updateFolderIdb();
    },
    /** 刪除資料夾及其所有子資料夾 */
    deleteFolder(folderId: string) {
      const idsToDelete = this.collectDescendantIds(folderId);

      idsToDelete.add(folderId);

      this.folderList = this.folderList.filter(f => !idsToDelete.has(f.folderId));

      return { deletedIds: idsToDelete, promise: this.updateFolderIdb() };
    },
    /** 導覽至指定資料夾 */
    navigateTo(folderId: string | null) {
      this.currentFolderId = folderId;
    },
    /** 移動資料夾到另一個資料夾 */
    moveFolder(folderId: string, targetParentId: string | null) {
      const folder = this.folderList.find(f => f.folderId === folderId);

      if (!folder) return;

      // 防止移動到自己或自己的子資料夾
      if (folderId === targetParentId) return;

      const descendants = this.collectDescendantIds(folderId);

      if (targetParentId !== null && descendants.has(targetParentId)) return;

      folder.parentId = targetParentId;
      folder.updateDate = Date.now();

      return this.updateFolderIdb();
    },
    /** 遞迴收集所有子資料夾 ID */
    collectDescendantIds(folderId: string): Set<string> {
      const result = new Set<string>();
      const stack = [folderId];

      while (stack.length > 0) {
        const parentId = stack.pop();

        for (const f of this.folderList) {
          if (f.parentId === parentId && !result.has(f.folderId)) {
            result.add(f.folderId);
            stack.push(f.folderId);
          }
        }
      }

      return result;
    },
    /** 寫入 IDB */
    updateFolderIdb() {
      return setIdb(IDB_KEY.FOLDER_LIST, this.folderList);
    },
  },
});
