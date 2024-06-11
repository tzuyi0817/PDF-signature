export interface PDF {
  PDFId: string;
  name: string;
  updateDate: number;
  PDFBase64: string;
  pages: number;
  canvas?: string[];
  trashDate?: number;
  isUpdate?: boolean;
}
