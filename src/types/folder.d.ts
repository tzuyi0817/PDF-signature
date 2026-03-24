/** 資料夾介面 */
export interface Folder {
  /** 資料夾唯一識別碼 */
  folderId: string;
  /** 資料夾名稱 */
  name: string;
  /** 父層資料夾 ID，null 表示根目錄 */
  parentId: string | null;
  /** 建立時間（時間戳） */
  createDate: number;
  /** 更新時間（時間戳） */
  updateDate: number;
}
